package com.cortexlumora.lunastories.subscriptions

import android.app.Activity
import android.app.Application
import android.content.Intent
import android.net.Uri
import com.cortexlumora.lunastories.BuildConfig
import com.revenuecat.purchases.LogLevel
import com.revenuecat.purchases.PurchaseParams
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesConfiguration
import com.revenuecat.purchases.awaitCustomerInfo
import com.revenuecat.purchases.awaitLogIn
import com.revenuecat.purchases.awaitLogOut
import com.revenuecat.purchases.awaitOfferings
import com.revenuecat.purchases.awaitPurchase
import com.revenuecat.purchases.awaitRestore
import com.revenuecat.purchases.models.StoreTransaction
import com.revenuecat.purchases.Offerings
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.Package

/**
 * RevenueCat integration for Android, mirrors iOS Subscriptions.swift.
 * Owns SDK init at app launch, alias of RC app-user-id ↔ backend user id
 * on Clerk sign-in / sign-out, and a thin wrapper around the
 * coroutine-friendly purchase / restore helpers so the rest of the app
 * doesn't import RC types directly.
 */
object Subscriptions {
    fun configure(application: Application) {
        Purchases.logLevel = LogLevel.INFO
        Purchases.configure(
            PurchasesConfiguration.Builder(application, BuildConfig.REVENUECAT_API_KEY).build(),
        )
    }

    /** Tie RC's app-user-id to the backend user so Pro follows the user across devices. */
    suspend fun login(userId: String) {
        runCatching { Purchases.sharedInstance.awaitLogIn(userId) }
    }

    suspend fun logout() {
        runCatching { Purchases.sharedInstance.awaitLogOut() }
    }

    suspend fun offerings(): Offerings? =
        runCatching { Purchases.sharedInstance.awaitOfferings() }.getOrNull()

    suspend fun customerInfo(): CustomerInfo? =
        runCatching { Purchases.sharedInstance.awaitCustomerInfo() }.getOrNull()

    /**
     * Returns the StoreTransaction + CustomerInfo on success, or throws a
     * PurchasesTransactionException whose payload includes the underlying
     * PurchasesError that the paywall surfaces verbatim.
     */
    suspend fun purchase(activity: Activity, pkg: Package): Pair<StoreTransaction?, CustomerInfo> {
        val params = PurchaseParams.Builder(activity, pkg).build()
        val r = Purchases.sharedInstance.awaitPurchase(params)
        return r.storeTransaction to r.customerInfo
    }

    suspend fun restore(): CustomerInfo = Purchases.sharedInstance.awaitRestore()

    // Entitlement identifier is case-sensitive and configured as "Pro" in the
    // RevenueCat dashboard — must match exactly (mirrors iOS).
    fun isEntitled(info: CustomerInfo?, entitlement: String = "Pro"): Boolean =
        info?.entitlements?.get(entitlement)?.isActive == true

    /**
     * Opens the Play Store's subscription management screen for the app.
     * Mirrors iOS Subscriptions.manage() (RC's showManageSubscriptions on iOS).
     * Play has no in-app sheet equivalent, so we route via the standard
     * deep-link URL with the applicationId.
     */
    fun manage(activity: Activity) {
        val url = "https://play.google.com/store/account/subscriptions?package=" +
            activity.packageName
        runCatching {
            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }
    }
}
