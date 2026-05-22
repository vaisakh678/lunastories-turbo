package com.cortexlumora.lunastories

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.cortexlumora.lunastories.ui.screens.OnboardingScreen
import com.cortexlumora.lunastories.ui.screens.SplashScreen
import com.cortexlumora.lunastories.ui.theme.LunaStoriesTheme
import com.cortexlumora.lunastories.ui.theme.MiloCream
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

private enum class Stage { Splash, Onboarding, Home }

@Composable
private fun RootFlow() {
    val context = LocalContext.current
    val prefs = remember {
        context.getSharedPreferences("luna_prefs", android.content.Context.MODE_PRIVATE)
    }
    val hasSeenOnboarding = remember {
        mutableStateOf(prefs.getBoolean("has_seen_onboarding", false))
    }
    var stage by remember { mutableStateOf(Stage.Splash) }

    // 1s minimum splash hold, then advance.
    LaunchedEffect(Unit) {
        delay(1000)
        stage = if (hasSeenOnboarding.value) Stage.Home else Stage.Onboarding
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AnimatedVisibility(
            visible = stage == Stage.Splash,
            enter = fadeIn(),
            exit = fadeOut(),
        ) {
            SplashScreen()
        }
        AnimatedVisibility(
            visible = stage == Stage.Onboarding,
            enter = fadeIn(),
            exit = fadeOut(),
        ) {
            OnboardingScreen(
                onFinish = {
                    prefs.edit().putBoolean("has_seen_onboarding", true).apply()
                    hasSeenOnboarding.value = true
                    stage = Stage.Home
                },
            )
        }
        AnimatedVisibility(
            visible = stage == Stage.Home,
            enter = fadeIn(),
            exit = fadeOut(),
        ) {
            HomePlaceholder()
        }
    }
}

@Composable
private fun HomePlaceholder() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground()
        Text(
            text = "Home (placeholder)",
            color = MiloCream,
        )
    }
}
