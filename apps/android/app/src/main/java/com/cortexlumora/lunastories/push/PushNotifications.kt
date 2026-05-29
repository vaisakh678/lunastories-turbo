package com.cortexlumora.lunastories.push

import android.content.Context
import com.cortexlumora.lunastories.BuildConfig
import com.cortexlumora.lunastories.viewmodels.DeepLinkRouter
import com.onesignal.OneSignal
import com.onesignal.debug.LogLevel
import com.onesignal.notifications.INotificationClickEvent
import com.onesignal.notifications.INotificationClickListener
import com.onesignal.notifications.INotificationLifecycleListener
import com.onesignal.notifications.INotificationWillDisplayEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * OneSignal v5 integration. Owns SDK init at app launch, the lazy permission
 * request (first generate), aliasing the OneSignal subscription to the backend
 * user id, and the tap handler that routes a story id into DeepLinkRouter so
 * RootFlow can open the reader. Mirrors iOS PushNotifications.swift.
 *
 * OneSignal bundles its own FCM handling — no google-services.json is needed
 * in the app. The Android platform's FCM credentials live in the OneSignal
 * dashboard.
 */
object PushNotifications {
    /** Call once during app launch (LunaApplication.onCreate). */
    fun configure(context: Context) {
        OneSignal.Debug.logLevel = LogLevel.WARN
        OneSignal.initWithContext(context, BuildConfig.ONESIGNAL_APP_ID)

        // Tap handler — fires whether the app was foreground, background, or
        // terminated. The backend puts {"storyId": "<uuid>"} in additionalData
        // when a story finishes; anything else just brings the app forward.
        OneSignal.Notifications.addClickListener(object : INotificationClickListener {
            override fun onClick(event: INotificationClickEvent) {
                val storyId = event.notification.additionalData
                    ?.optString("storyId")
                    ?.takeIf { it.isNotBlank() }
                if (storyId != null) DeepLinkRouter.openStory(storyId)
            }
        })

        // Foreground lifecycle — suppress the OS banner (the in-app home banner
        // already surfaces "story ready") and nudge the latest-story poll so it
        // updates immediately. Mirrors iOS NotificationForegroundHandler.
        OneSignal.Notifications.addForegroundLifecycleListener(object : INotificationLifecycleListener {
            override fun onWillDisplay(event: INotificationWillDisplayEvent) {
                event.preventDefault()
                DeepLinkRouter.pokeRefresh()
            }
        })
    }

    /** Ask the OS for permission lazily (first generate tap), so we don't
     *  ambush the user on first launch. */
    fun requestPermissionIfNeeded() {
        CoroutineScope(Dispatchers.IO).launch {
            runCatching { OneSignal.Notifications.requestPermission(false) }
        }
    }

    /** Tie the OneSignal subscription to the backend user id so the backend
     *  can target this user across reinstalls and devices. */
    fun login(userId: String) = OneSignal.login(userId)

    fun logout() = OneSignal.logout()
}
