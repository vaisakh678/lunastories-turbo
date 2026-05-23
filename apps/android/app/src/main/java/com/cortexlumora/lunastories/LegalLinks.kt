package com.cortexlumora.lunastories

/**
 * Single source of truth for Terms & Privacy URLs on Android. Mirrors
 * iOS `apps/ios/Luna Stories/LegalLinks.swift` — keep these in sync
 * across both platforms so no app version ever links to a stale or
 * mismatched URL.
 */
object LegalLinks {
    const val TERMS_URL = "https://lunastories.cortexlumora.com/terms"
    const val PRIVACY_URL = "https://lunastories.cortexlumora.com/privacy"
}
