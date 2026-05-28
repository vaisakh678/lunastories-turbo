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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import kotlinx.coroutines.launch
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.clerk.api.Clerk
import com.cortexlumora.lunastories.auth.AuthFlowViewModel
import com.cortexlumora.lunastories.auth.AuthMode
import com.cortexlumora.lunastories.auth.AuthStep
import com.cortexlumora.lunastories.network.CharacterResponse
import com.cortexlumora.lunastories.network.CharacterRole
import com.cortexlumora.lunastories.analytics.Analytics
import com.cortexlumora.lunastories.network.UsageAPI
import com.cortexlumora.lunastories.network.UserAPI
import com.cortexlumora.lunastories.ui.components.ToastCenter
import com.cortexlumora.lunastories.ui.components.ToastOverlay
import com.cortexlumora.lunastories.ui.components.ToastStyle
import com.cortexlumora.lunastories.stories.StoryGenerationManager
import com.cortexlumora.lunastories.stories.StoryMode
import com.cortexlumora.lunastories.ui.screens.AccountScreen
import com.cortexlumora.lunastories.ui.screens.CharacterWizardSheet
import com.cortexlumora.lunastories.ui.screens.EmailSheet
import com.cortexlumora.lunastories.ui.screens.OtpSheet
import com.cortexlumora.lunastories.ui.screens.ProviderSheet
import com.cortexlumora.lunastories.ui.screens.ChooseModeScreen
import com.cortexlumora.lunastories.ui.screens.FeedbackScreen
import com.cortexlumora.lunastories.ui.screens.MyStoriesScreen
import com.cortexlumora.lunastories.ui.screens.SettingsScreen
import com.cortexlumora.lunastories.ui.screens.CreateOrUpdate
import com.cortexlumora.lunastories.ui.screens.GeneratingScreen
import com.cortexlumora.lunastories.ui.screens.GetStartedScreen
import com.cortexlumora.lunastories.ui.screens.HomeScreen
import com.cortexlumora.lunastories.ui.screens.ModeFormScreen
import com.cortexlumora.lunastories.ui.screens.OnboardingScreen
import com.cortexlumora.lunastories.ui.screens.PaywallScreen
import com.cortexlumora.lunastories.ui.screens.SplashScreen
import com.cortexlumora.lunastories.subscriptions.Subscriptions
import com.cortexlumora.lunastories.ui.screens.StoryReaderScreen
import com.cortexlumora.lunastories.ui.theme.LunaStoriesTheme
import com.cortexlumora.lunastories.viewmodels.CharactersViewModel
import com.cortexlumora.lunastories.viewmodels.SubscriptionsViewModel
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

private enum class Stage { Splash, Auth, Home }

private data class WizardTarget(val role: CharacterRole, val existing: CharacterResponse?)

private enum class AccountSubroute { MyStories, Settings, Feedback }

private sealed class StoryRoute {
    data class ChooseMode(val characters: List<CharacterResponse>) : StoryRoute()
    data class ModeForm(val mode: StoryMode, val characters: List<CharacterResponse>) : StoryRoute()
    data object Generating : StoryRoute()
    data class Reader(val storyId: String) : StoryRoute()
}

@Composable
private fun RootFlow() {
    val user by Clerk.userFlow.collectAsStateWithLifecycle(initialValue = null)
    val isClerkLoaded by Clerk.isInitialized.collectAsStateWithLifecycle(initialValue = false)

    var minimumHoldDone by remember { mutableStateOf(false) }
    var wizardTarget by remember { mutableStateOf<WizardTarget?>(null) }
    var storyRoute by remember { mutableStateOf<StoryRoute?>(null) }
    var showAccount by remember { mutableStateOf(false) }
    var accountSubroute by remember { mutableStateOf<AccountSubroute?>(null) }
    var showOnboardingCarousel by remember { mutableStateOf(false) }
    var showPaywall by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()
    val charactersVm: CharactersViewModel = viewModel()
    val subscriptionsVm: SubscriptionsViewModel = viewModel()
    val customerInfo by subscriptionsVm.customerInfo.collectAsStateWithLifecycle(initialValue = null)
    val isPro = com.cortexlumora.lunastories.subscriptions.Subscriptions.isEntitled(customerInfo)
    val authVm: AuthFlowViewModel = viewModel()
    val authStep by authVm.step.collectAsStateWithLifecycle(initialValue = null)
    val authLoadingProvider by authVm.loadingProvider.collectAsStateWithLifecycle(initialValue = null)
    val authIsSubmitting by authVm.isSubmitting.collectAsStateWithLifecycle(initialValue = false)
    val authError by authVm.error.collectAsStateWithLifecycle(initialValue = null)

    LaunchedEffect(Unit) {
        delay(1000)
        minimumHoldDone = true
    }

    val readyToLeaveSplash = minimumHoldDone && isClerkLoaded

    val stage: Stage = when {
        !readyToLeaveSplash -> Stage.Splash
        user != null -> Stage.Home
        else -> Stage.Auth
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AnimatedVisibility(visible = stage == Stage.Splash, enter = fadeIn(), exit = fadeOut()) {
            SplashScreen()
        }
        AnimatedVisibility(visible = stage == Stage.Auth, enter = fadeIn(), exit = fadeOut()) {
            GetStartedScreen(
                onStartSignUp = { showOnboardingCarousel = true },
                onSignIn = { authVm.open(AuthMode.SignIn) },
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
        // Toasts (generation rejection, "running low" warnings) pinned to the
        // top, above the main content. Full-screen Dialogs render their own
        // ToastOverlay so warnings remain visible while reading.
        ToastOverlay()
    }

    if (showOnboardingCarousel && stage == Stage.Auth) {
        Dialog(
            onDismissRequest = { showOnboardingCarousel = false },
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
                OnboardingScreen(
                    onFinish = {
                        showOnboardingCarousel = false
                        authVm.open(AuthMode.SignUp)
                    },
                )
            }
        }
    }

    authStep?.let { step ->
        Dialog(
            onDismissRequest = authVm::close,
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
                when (step) {
                    is AuthStep.Providers -> ProviderSheet(
                        mode = step.mode,
                        loadingProvider = authLoadingProvider,
                        onClose = authVm::close,
                        onPickGoogle = authVm::startGoogleOAuth,
                        onPickEmail = authVm::startEmailFlow,
                    )
                    is AuthStep.Email -> EmailSheet(
                        isSubmitting = authIsSubmitting,
                        onClose = authVm::backToProviders,
                        onSubmit = authVm::submitEmail,
                    )
                    is AuthStep.Otp -> OtpSheet(
                        email = step.email,
                        isSubmitting = authIsSubmitting,
                        onClose = authVm::close,
                        onVerify = authVm::verifyOtp,
                        onResend = authVm::resendOtp,
                    )
                }
            }
        }
    }

    authError?.let { msg ->
        androidx.compose.material3.AlertDialog(
            onDismissRequest = authVm::clearError,
            title = { androidx.compose.material3.Text("Sign-in failed") },
            text = { androidx.compose.material3.Text(msg) },
            confirmButton = {
                androidx.compose.material3.TextButton(onClick = authVm::clearError) {
                    androidx.compose.material3.Text("OK")
                }
            },
        )
    }

    LaunchedEffect(user) {
        if (user != null) {
            authVm.close()
            // Register the *backend* user id (a DB UUID from /users/me) with
            // RevenueCat — NOT the Clerk id. The RevenueCat webhook matches
            // events to users by UUID, so a Clerk id (user_…) is dropped as an
            // unknown user and Pro never syncs to the backend. Mirrors iOS
            // (ContentView.syncProfileAndPush). Best effort: if the profile
            // fetch fails we skip, and the next launch retries.
            val backendId = runCatching { UserAPI.me().id }.getOrNull()
            if (backendId != null) {
                Subscriptions.login(backendId)
                // Same backend id for analytics so a person's events line up
                // with their subscription. No-op unless POSTHOG_ENABLED.
                Analytics.identify(backendId)
            }
        } else {
            // Signed out — drop the RC alias and analytics identity so the next
            // signed-in user doesn't inherit cached state.
            Subscriptions.logout()
            Analytics.reset()
        }
    }

    if (showPaywall) {
        Dialog(
            onDismissRequest = { showPaywall = false },
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
                PaywallScreen(onDismiss = { showPaywall = false })
            }
        }
    }

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
                AccountScreen(
                    onBack = { showAccount = false },
                    onOpenMyStories = { accountSubroute = AccountSubroute.MyStories },
                    onOpenSettings = { accountSubroute = AccountSubroute.Settings },
                    onOpenFeedback = { accountSubroute = AccountSubroute.Feedback },
                    onOpenPaywall = { showPaywall = true },
                    isPro = isPro,
                )
            }
        }
    }

    accountSubroute?.let { sub ->
        Dialog(
            onDismissRequest = { accountSubroute = null },
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
                when (sub) {
                    AccountSubroute.MyStories -> MyStoriesScreen(
                        onBack = { accountSubroute = null },
                        onOpenStory = { id ->
                            accountSubroute = null
                            showAccount = false
                            storyRoute = StoryRoute.Reader(id)
                        },
                    )
                    AccountSubroute.Settings -> SettingsScreen(onBack = { accountSubroute = null })
                    AccountSubroute.Feedback -> FeedbackScreen(onClose = { accountSubroute = null })
                }
            }
        }
    }

    storyRoute?.let { route ->
        Dialog(
            onDismissRequest = { storyRoute = null },
            properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
        ) {
            Surface(modifier = Modifier.fillMaxSize()) {
              Box(modifier = Modifier.fillMaxSize()) {
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
                            // Generation is Pro-gated (backend returns 402 too).
                            // Catch it here at the final step so non-subscribers
                            // get the paywall instead of a failed generation +
                            // toast. Mirrors iOS ModeSheetView.handleComplete.
                            if (!isPro) {
                                showPaywall = true
                            } else {
                                StoryGenerationManager.start(payload, title, cues)
                                storyRoute = StoryRoute.Generating
                            }
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
                            // A story just landed — refresh usage and warn once
                            // weekly stories cross 80% (but aren't fully spent;
                            // the exhausted case is the rejection toast above).
                            // Mirrors iOS HomeView's onChange(ready) handler.
                            scope.launch {
                                val stories = runCatching { UsageAPI.fetch() }.getOrNull()?.stories
                                if (stories != null && stories.percentUsed >= 80 && stories.remaining > 0) {
                                    ToastCenter.show(
                                        message = stories.message,
                                        title = "Running low on stories",
                                        style = ToastStyle.Warning,
                                        progress = stories.percentUsed / 100f,
                                        durationMs = 5_000,
                                    )
                                }
                            }
                        },
                        onFailed = { message ->
                            // Quota/other generation failure: clear the in-flight
                            // slot, close this sheet, and surface the server's
                            // message as a toast. Mirrors iOS ModeSheetView.
                            StoryGenerationManager.acknowledge()
                            storyRoute = null
                            ToastCenter.show(message, style = ToastStyle.Error)
                        },
                    )
                    is StoryRoute.Reader -> StoryReaderScreen(
                        storyId = route.storyId,
                        onBack = { storyRoute = null },
                        onRegenerate = { storyRoute = StoryRoute.Generating },
                    )
                }
                // Render toasts above the full-screen story Dialog so the
                // "running low" warning fired on a story landing is visible.
                ToastOverlay()
              }
            }
        }
    }
}
