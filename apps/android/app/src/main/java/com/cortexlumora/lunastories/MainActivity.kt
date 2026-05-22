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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.clerk.api.Clerk
import com.clerk.ui.auth.AuthView
import com.cortexlumora.lunastories.network.CharacterResponse
import com.cortexlumora.lunastories.network.CharacterRole
import com.cortexlumora.lunastories.stories.StoryGenerationManager
import com.cortexlumora.lunastories.stories.StoryMode
import com.cortexlumora.lunastories.ui.screens.AccountScreen
import com.cortexlumora.lunastories.ui.screens.CharacterWizardSheet
import com.cortexlumora.lunastories.ui.screens.ChooseModeScreen
import com.cortexlumora.lunastories.ui.screens.CreateOrUpdate
import com.cortexlumora.lunastories.ui.screens.GeneratingScreen
import com.cortexlumora.lunastories.ui.screens.GetStartedScreen
import com.cortexlumora.lunastories.ui.screens.HomeScreen
import com.cortexlumora.lunastories.ui.screens.ModeFormScreen
import com.cortexlumora.lunastories.ui.screens.OnboardingScreen
import com.cortexlumora.lunastories.ui.screens.SplashScreen
import com.cortexlumora.lunastories.ui.screens.StoryReaderScreen
import com.cortexlumora.lunastories.ui.theme.LunaStoriesTheme
import com.cortexlumora.lunastories.viewmodels.CharactersViewModel
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

private data class WizardTarget(val role: CharacterRole, val existing: CharacterResponse?)

private sealed class StoryRoute {
    data class ChooseMode(val characters: List<CharacterResponse>) : StoryRoute()
    data class ModeForm(val mode: StoryMode, val characters: List<CharacterResponse>) : StoryRoute()
    data object Generating : StoryRoute()
    data class Reader(val storyId: String) : StoryRoute()
}

@Composable
private fun RootFlow() {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("luna_prefs", Context.MODE_PRIVATE) }
    val hasSeenOnboarding = remember { mutableStateOf(prefs.getBoolean("has_seen_onboarding", false)) }

    val user by Clerk.userFlow.collectAsStateWithLifecycle(initialValue = null)
    val isClerkLoaded by Clerk.isInitialized.collectAsStateWithLifecycle(initialValue = false)

    var minimumHoldDone by remember { mutableStateOf(false) }
    var showAuthSheet by remember { mutableStateOf(false) }
    var wizardTarget by remember { mutableStateOf<WizardTarget?>(null) }
    var storyRoute by remember { mutableStateOf<StoryRoute?>(null) }
    var showAccount by remember { mutableStateOf(false) }

    val charactersVm: CharactersViewModel = viewModel()

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
            HomeScreen(
                vm = charactersVm,
                onOpenWizard = { role, existing -> wizardTarget = WizardTarget(role, existing) },
                onStartFlow = { selected -> storyRoute = StoryRoute.ChooseMode(selected) },
                onOpenStory = { id -> storyRoute = StoryRoute.Reader(id) },
                onOpenAccount = { showAccount = true },
            )
        }
    }

    if (showAuthSheet && stage == Stage.Auth) {
        Dialog(
            onDismissRequest = { showAuthSheet = false },
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) { AuthView() }
        }
    }

    LaunchedEffect(user) { if (user != null) showAuthSheet = false }

    wizardTarget?.let { target ->
        Dialog(
            onDismissRequest = { wizardTarget = null },
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
                CharacterWizardSheet(
                    role = target.role,
                    existing = target.existing,
                    onDismiss = { wizardTarget = null },
                    onSubmit = { op ->
                        when (op) {
                            is CreateOrUpdate.Create -> charactersVm.create(op.request)
                            is CreateOrUpdate.Update -> charactersVm.update(op.id, op.request)
                        }
                    },
                    onDelete = { id -> charactersVm.delete(id) },
                )
            }
        }
    }

    if (showAccount) {
        Dialog(
            onDismissRequest = { showAccount = false },
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
                AccountScreen(onBack = { showAccount = false })
            }
        }
    }

    storyRoute?.let { route ->
        Dialog(
            onDismissRequest = { storyRoute = null },
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
                when (route) {
                    is StoryRoute.ChooseMode -> ChooseModeScreen(
                        onDismiss = { storyRoute = null },
                        onPickMode = { mode ->
                            storyRoute = StoryRoute.ModeForm(mode, route.characters)
                        },
                    )
                    is StoryRoute.ModeForm -> ModeFormScreen(
                        mode = route.mode,
                        characters = route.characters,
                        onDismiss = { storyRoute = StoryRoute.ChooseMode(route.characters) },
                        onGenerate = { payload, title, cues ->
                            StoryGenerationManager.start(payload, title, cues)
                            storyRoute = StoryRoute.Generating
                        },
                    )
                    is StoryRoute.Generating -> GeneratingScreen(
                        onCancel = {
                            StoryGenerationManager.acknowledge()
                            storyRoute = null
                        },
                        onReady = { story ->
                            StoryGenerationManager.acknowledge()
                            storyRoute = StoryRoute.Reader(story.id)
                        },
                        onFailed = { _ ->
                            // leave manager state for banner; close generating sheet
                            storyRoute = null
                        },
                    )
                    is StoryRoute.Reader -> StoryReaderScreen(
                        storyId = route.storyId,
                        onBack = { storyRoute = null },
                        onRegenerate = { storyRoute = StoryRoute.Generating },
                    )
                }
            }
        }
    }
}
