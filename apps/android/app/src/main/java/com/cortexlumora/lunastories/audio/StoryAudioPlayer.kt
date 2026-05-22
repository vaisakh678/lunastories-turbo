package com.cortexlumora.lunastories.audio

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Lifecycle-aware ExoPlayer wrapper for a single story audio file.
 * Foreground-only (no MediaSessionService) — playback pauses when the
 * activity stops. Exposes StateFlows that the audio bar composable
 * collects.
 */
class StoryAudioPlayer(context: Context) {
    private val player: ExoPlayer = ExoPlayer.Builder(context).build()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var positionJob: Job? = null

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _positionMs = MutableStateFlow(0L)
    val positionMs: StateFlow<Long> = _positionMs.asStateFlow()

    private val _durationMs = MutableStateFlow(0L)
    val durationMs: StateFlow<Long> = _durationMs.asStateFlow()

    private val _isReady = MutableStateFlow(false)
    val isReady: StateFlow<Boolean> = _isReady.asStateFlow()

    private var currentUrl: String? = null

    init {
        player.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                _isPlaying.value = isPlaying
                if (isPlaying) startPositionTicker() else stopPositionTicker()
            }
            override fun onPlaybackStateChanged(state: Int) {
                if (state == Player.STATE_READY) {
                    _isReady.value = true
                    val d = player.duration
                    _durationMs.value = if (d == androidx.media3.common.C.TIME_UNSET) 0L else d
                }
            }
        })
    }

    /** Idempotent — calling with the same url is a no-op. */
    fun loadIfNeeded(url: String) {
        if (currentUrl == url) return
        currentUrl = url
        _isReady.value = false
        _positionMs.value = 0L
        _durationMs.value = 0L
        player.setMediaItem(MediaItem.fromUri(url))
        player.prepare()
    }

    fun togglePlay() {
        if (player.isPlaying) player.pause() else player.play()
    }

    fun seekTo(ms: Long) {
        player.seekTo(ms.coerceIn(0L, player.duration.coerceAtLeast(0L)))
        _positionMs.value = ms
    }

    fun release() {
        stopPositionTicker()
        player.release()
        scope.cancel()
    }

    private fun startPositionTicker() {
        stopPositionTicker()
        positionJob = scope.launch {
            while (true) {
                _positionMs.value = player.currentPosition
                val d = player.duration
                if (d != androidx.media3.common.C.TIME_UNSET) _durationMs.value = d
                delay(250)
            }
        }
    }

    private fun stopPositionTicker() {
        positionJob?.cancel()
        positionJob = null
    }
}

private fun CoroutineScope.cancel() {
    coroutineContext[Job]?.cancel()
}
