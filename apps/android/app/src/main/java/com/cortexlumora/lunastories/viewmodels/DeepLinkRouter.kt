package com.cortexlumora.lunastories.viewmodels

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * App-scoped inbox for deep links arriving from outside the Compose tree
 * (push-notification taps today). The OneSignal click handler writes a
 * pending story id here; RootFlow observes it, opens the reader, and clears
 * it so a subsequent identical tap still registers. Mirrors iOS DeepLinkRouter.
 *
 * A singleton object (not a ViewModel) because the OneSignal listeners are
 * registered at Application scope and have no composable to inject into.
 */
object DeepLinkRouter {
    private val _pendingStoryId = MutableStateFlow<String?>(null)
    val pendingStoryId: StateFlow<String?> = _pendingStoryId.asStateFlow()

    /** Bumped whenever a foreground push lands, so Home can refresh its banner
     *  immediately rather than waiting for the next 5s poll tick. */
    private val _refreshTick = MutableStateFlow(0)
    val refreshTick: StateFlow<Int> = _refreshTick.asStateFlow()

    fun openStory(id: String) { _pendingStoryId.value = id }

    fun consume() { _pendingStoryId.value = null }

    fun pokeRefresh() { _refreshTick.value += 1 }
}
