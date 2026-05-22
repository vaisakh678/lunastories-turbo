package com.cortexlumora.lunastories

import android.app.Application
import com.clerk.api.Clerk

class LunaApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Clerk.initialize(this, BuildConfig.CLERK_PUBLISHABLE_KEY)
    }
}
