package com.cortexlumora.lunastories

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clerk.api.Clerk
import com.clerk.ui.auth.AuthView
import com.cortexlumora.lunastories.ui.screens.GetStartedScreen
import com.cortexlumora.lunastories.ui.screens.HomeScreen
import com.cortexlumora.lunastories.ui.screens.OnboardingScreen
import com.cortexlumora.lunastories.ui.screens.SplashScreen
import com.cortexlumora.lunastories.ui.theme.LunaStoriesTheme
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LunaStoriesTheme {
                RootFlow()
            }
        }
    }
}

private enum class Stage { Splash, Onboarding, Auth, Home }

@Composable
private fun RootFlow() {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("luna_prefs", Context.MODE_PRIVATE) }
    val hasSeenOnboarding = remember { mutableStateOf(prefs.getBoolean("has_seen_onboarding", false)) }

    // Clerk session state. Null when signed out, non-null when restored or after sign-in.
    val user by Clerk.userFlow.collectAsStateWithLifecycle(initialValue = null)
    val isClerkLoaded by Clerk.isInitialized.collectAsStateWithLifecycle(initialValue = false)

    var minimumHoldDone by remember { mutableStateOf(false) }
    var showAuthSheet by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        delay(1000)
        minimumHoldDone = true
    }

    val readyToLeaveSplash = minimumHoldDone && isClerkLoaded

    val stage: Stage = when {
        !readyToLeaveSplash -> Stage.Splash
        !hasSeenOnboarding.value -> Stage.Onboarding
        user != null -> Stage.Home
        else -> Stage.Auth
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AnimatedVisibility(visible = stage == Stage.Splash, enter = fadeIn(), exit = fadeOut()) {
            SplashScreen()
        }
        AnimatedVisibility(visible = stage == Stage.Onboarding, enter = fadeIn(), exit = fadeOut()) {
            OnboardingScreen(
                onFinish = {
                    prefs.edit().putBoolean("has_seen_onboarding", true).apply()
                    hasSeenOnboarding.value = true
                },
            )
        }
        AnimatedVisibility(visible = stage == Stage.Auth, enter = fadeIn(), exit = fadeOut()) {
            GetStartedScreen(
                onStartSignUp = { showAuthSheet = true },
                onSignIn = { showAuthSheet = true },
            )
        }
        AnimatedVisibility(visible = stage == Stage.Home, enter = fadeIn(), exit = fadeOut()) {
            HomeScreen()
        }
    }

    if (showAuthSheet && stage == Stage.Auth) {
        Dialog(
            onDismissRequest = { showAuthSheet = false },
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
                decorFitsSystemWindows = false,
            ),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
                AuthView()
            }
        }
    }

    // Close the sheet automatically once Clerk reports a signed-in user.
    LaunchedEffect(user) {
        if (user != null) showAuthSheet = false
    }
}
