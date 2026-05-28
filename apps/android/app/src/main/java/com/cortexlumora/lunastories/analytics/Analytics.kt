package com.cortexlumora.lunastories.analytics

import android.content.Context
import com.cortexlumora.lunastories.BuildConfig
import com.posthog.PostHog
import com.posthog.android.PostHogAndroid
import com.posthog.android.PostHogAndroidConfig

/**
 * PostHog analytics, mirrors iOS Analytics.swift. Gated behind
 * BuildConfig.POSTHOG_ENABLED so debug/dev builds stay out of the single
 * PostHog project. Owns SDK init at app launch and identify/reset on Clerk
 * sign-in / sign-out, keyed by the backend user id (same id RevenueCat and
 * OneSignal use), so a person's events line up across services.
 */
object Analytics {
    fun configure(context: Context) {
        if (!BuildConfig.POSTHOG_ENABLED) return
        val config = PostHogAndroidConfig(
            apiKey = BuildConfig.POSTHOG_API_KEY,
            host = BuildConfig.POSTHOG_HOST,
        ).apply {
            captureScreenViews = true
            captureApplicationLifecycleEvents = true
        }
        PostHogAndroid.setup(context, config)
    }

    /** Tie events to the backend user id once we know it (post sign-in). */
    fun identify(userId: String) {
        if (!BuildConfig.POSTHOG_ENABLED) return
        PostHog.identify(userId)
    }

    /** Drop the identified user on sign-out so the next user starts clean. */
    fun reset() {
        if (!BuildConfig.POSTHOG_ENABLED) return
        PostHog.reset()
    }

    fun capture(event: String, properties: Map<String, Any>? = null) {
        if (!BuildConfig.POSTHOG_ENABLED) return
        PostHog.capture(event, properties = properties)
    }
}
