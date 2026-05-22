package com.cortexlumora.lunastories.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cortexlumora.lunastories.network.StoryAPI
import com.cortexlumora.lunastories.network.StoryResponse
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Polls GET /stories/latest-active every 5 s when the consumer says
 * `pollingEnabled = true` (Home flips it off whenever an in-flight
 * generation is showing — that banner takes precedence). Tracks
 * in-session dismissals so the banner doesn't pop right back up.
 */
class LatestStoryViewModel : ViewModel() {
    private val _story = MutableStateFlow<StoryResponse?>(null)
    val story: StateFlow<StoryResponse?> = _story.asStateFlow()

    private val dismissed = mutableSetOf<String>()

    init {
        viewModelScope.launch { pollLoop() }
    }

    private suspend fun pollLoop() {
        while (true) {
            val latest = runCatching { StoryAPI.latestActive() }.getOrNull()
            _story.value = latest?.takeIf { it.id !in dismissed }
            delay(5_000)
        }
    }

    fun refreshNow() {
        viewModelScope.launch {
            val latest = runCatching { StoryAPI.latestActive() }.getOrNull()
            _story.value = latest?.takeIf { it.id !in dismissed }
        }
    }

    fun dismiss(id: String) {
        dismissed += id
        if (_story.value?.id == id) _story.value = null
    }

    fun consume(id: String) = dismiss(id)
}
