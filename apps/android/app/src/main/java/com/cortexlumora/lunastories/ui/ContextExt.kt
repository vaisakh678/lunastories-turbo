package com.cortexlumora.lunastories.ui

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper

/**
 * Walk the ContextWrapper chain to the hosting Activity. `LocalContext.current`
 * inside a Compose Dialog is a wrapper (not the Activity), so a plain
 * `context as? Activity` returns null — which silently broke RevenueCat
 * purchase / manage flows launched from dialogs.
 */
tailrec fun Context.findActivity(): Activity? = when (this) {
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}
