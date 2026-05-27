package com.cortexlumora.lunastories.stories

import androidx.compose.ui.graphics.Color
import com.cortexlumora.lunastories.network.APIClient
import com.cortexlumora.lunastories.network.CreateStoryRequest
import com.cortexlumora.lunastories.network.StoryAPI
import com.cortexlumora.lunastories.network.StoryResponse
import com.cortexlumora.lunastories.network.StoryStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement

data class GenerationCue(
    val id: String,
    val label: String,
    val drawableRes: Int?,
    val tintName: String,
    /**
     * Bundled avatar UUID for a character cue. When set, the generating
     * carousel renders the child's avatar image (resolved at draw time)
     * instead of a catalog drawable or the label initials. Mirrors iOS,
     * where the cue's avatar lives in `symbolName`.
     */
    val avatarId: String? = null,
)

sealed class GenerationStatus {
    data object Generating : GenerationStatus()
    data class Ready(val story: StoryResponse) : GenerationStatus()
    data class Failed(val message: String) : GenerationStatus()
}

data class InFlightGeneration(
    val title: String,
    val cues: List<GenerationCue>,
    val startedAtMs: Long,
    val status: GenerationStatus,
)

data class StoryInputPayload(
    val modeKey: String,
    val characterIds: List<String>,
    val input: JsonElement,
)

/**
 * Singleton in-flight tracker. Mirrors iOS StoryGenerationManager: one
 * slot, the caller fires-and-forgets, screens observe `inFlight.status`.
 */
object StoryGenerationManager {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var pollJob: Job? = null

    private val _inFlight = MutableStateFlow<InFlightGeneration?>(null)
    val inFlight: StateFlow<InFlightGeneration?> = _inFlight.asStateFlow()

    fun start(payload: StoryInputPayload, title: String, cues: List<GenerationCue>) {
        pollJob?.cancel()
        _inFlight.value = InFlightGeneration(
            title = title,
            cues = cues,
            startedAtMs = System.currentTimeMillis(),
            status = GenerationStatus.Generating,
        )
        pollJob = scope.launch {
            runCatching {
                val initial = StoryAPI.create(
                    CreateStoryRequest(
                        modeKey = payload.modeKey,
                        characterIds = payload.characterIds,
                        input = payload.input,
                    ),
                )
                pollUntilDone(initial.id)
            }.onFailure { err ->
                _inFlight.value = _inFlight.value?.copy(
                    status = GenerationStatus.Failed(err.message ?: "Generation failed"),
                )
            }
        }
    }

    private suspend fun pollUntilDone(id: String) {
        val deadline = System.currentTimeMillis() + 120_000L // 2 min ceiling
        while (System.currentTimeMillis() < deadline) {
            val story = runCatching { StoryAPI.get(id) }.getOrNull()
            when (story?.status) {
                StoryStatus.ready -> {
                    _inFlight.value = _inFlight.value?.copy(status = GenerationStatus.Ready(story))
                    return
                }
                StoryStatus.failed -> {
                    _inFlight.value = _inFlight.value?.copy(
                        status = GenerationStatus.Failed(story.errorMessage ?: "Generation failed"),
                    )
                    return
                }
                else -> delay(2_000)
            }
        }
        _inFlight.value = _inFlight.value?.copy(
            status = GenerationStatus.Failed("Timed out waiting for the story"),
        )
    }

    fun acknowledge() {
        pollJob?.cancel()
        _inFlight.value = null
    }
}
