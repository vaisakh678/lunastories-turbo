package com.cortexlumora.lunastories.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clerk.api.network.model.error.firstMessage
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.signin.SignIn
import com.clerk.api.signin.attemptFirstFactor
import com.clerk.api.signup.SignUp
import com.clerk.api.signup.attemptVerification
import com.clerk.api.signup.sendEmailCode
import com.clerk.api.sso.OAuthProvider
import com.clerk.api.Clerk
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AuthMode { SignIn, SignUp }

sealed class AuthStep {
    data class Providers(val mode: AuthMode) : AuthStep()
    data class Email(val mode: AuthMode) : AuthStep()
    data class Otp(val mode: AuthMode, val email: String) : AuthStep()
}

enum class AuthProviderKind { Google, Email }

/**
 * Drives the custom 3-step auth flow (Providers → Email → Otp). Mirrors
 * iOS AuthFlowModel — calls Clerk's API surface directly (no prebuilt
 * UI) so the UX matches the iOS SignInModal exactly.
 */
class AuthFlowViewModel : ViewModel() {
    private val _step = MutableStateFlow<AuthStep?>(null)
    val step: StateFlow<AuthStep?> = _step.asStateFlow()

    private val _loadingProvider = MutableStateFlow<AuthProviderKind?>(null)
    val loadingProvider: StateFlow<AuthProviderKind?> = _loadingProvider.asStateFlow()

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // Held between createOtp and verifyOtp so we can call .attempt* on the right resource.
    private var pendingSignIn: SignIn? = null
    private var pendingSignUp: SignUp? = null

    fun open(mode: AuthMode) {
        _error.value = null
        _step.value = AuthStep.Providers(mode)
    }

    fun close() {
        _step.value = null
        _error.value = null
        _loadingProvider.value = null
        _isSubmitting.value = false
        pendingSignIn = null
        pendingSignUp = null
    }

    fun clearError() { _error.value = null }

    fun startEmailFlow() {
        val current = _step.value as? AuthStep.Providers ?: return
        _step.value = AuthStep.Email(current.mode)
    }

    fun backToProviders() {
        val current = _step.value
        val mode = when (current) {
            is AuthStep.Email -> current.mode
            is AuthStep.Otp -> current.mode
            is AuthStep.Providers -> current.mode
            null -> AuthMode.SignIn
        }
        _step.value = AuthStep.Providers(mode)
    }

    fun startGoogleOAuth() {
        if (_loadingProvider.value != null) return
        _loadingProvider.value = AuthProviderKind.Google
        _error.value = null
        viewModelScope.launch {
            when (val r = Clerk.auth.signInWithOAuth(OAuthProvider.GOOGLE)) {
                is ClerkResult.Success -> { /* userFlow flips, RootFlow swaps */ }
                is ClerkResult.Failure -> _error.value = r.errorMessage()
            }
            _loadingProvider.value = null
        }
    }

    /** Send the 6-digit code for the given email. Routes through signIn or signUp depending on mode. */
    fun submitEmail(rawEmail: String) {
        val current = _step.value as? AuthStep.Email ?: return
        val email = rawEmail.trim()
        if (!isValidEmail(email)) return

        _isSubmitting.value = true
        _error.value = null
        viewModelScope.launch {
            val ok = when (current.mode) {
                AuthMode.SignIn -> startSignInOtp(email)
                AuthMode.SignUp -> startSignUpOtp(email)
            }
            _isSubmitting.value = false
            if (ok) {
                _step.value = AuthStep.Otp(current.mode, email)
            }
        }
    }

    private suspend fun startSignInOtp(email: String): Boolean {
        return when (val r = Clerk.auth.signInWithOtp { this.email = email }) {
            is ClerkResult.Success -> {
                pendingSignIn = r.value
                pendingSignUp = null
                true
            }
            is ClerkResult.Failure -> {
                // Passwordless: if there's no account for this email yet, fall
                // through to creating one so "Sign in" also works for brand-new
                // users. Clerk reports this with form_identifier_not_found; any
                // other failure is a real error we surface as-is.
                if (r.errorCode() == "form_identifier_not_found") {
                    startSignUpOtp(email)
                } else {
                    _error.value = r.errorMessage()
                    false
                }
            }
        }
    }

    private suspend fun startSignUpOtp(email: String): Boolean {
        val created = Clerk.auth.signUp { this.email = email }
        if (created is ClerkResult.Failure) {
            _error.value = created.errorMessage()
            return false
        }
        val signUp = (created as ClerkResult.Success).value
        // Send the email code after the sign-up is created.
        return when (val sent = signUp.sendEmailCode()) {
            is ClerkResult.Success -> {
                pendingSignUp = sent.value
                pendingSignIn = null
                true
            }
            is ClerkResult.Failure -> {
                _error.value = sent.errorMessage()
                false
            }
        }
    }

    fun resendOtp() {
        val current = _step.value as? AuthStep.Otp ?: return
        viewModelScope.launch {
            when (current.mode) {
                AuthMode.SignIn -> startSignInOtp(current.email)
                AuthMode.SignUp -> startSignUpOtp(current.email)
            }
        }
    }

    fun verifyOtp(code: String) {
        if (code.length != 6) return
        _isSubmitting.value = true
        _error.value = null
        viewModelScope.launch {
            val ok = pendingSignIn?.let { verifyOnSignIn(it, code) }
                ?: pendingSignUp?.let { verifyOnSignUp(it, code) }
                ?: run {
                    _error.value = "Lost track of the verification — please go back and try again."
                    false
                }
            _isSubmitting.value = false
            if (ok) close()
        }
    }

    private suspend fun verifyOnSignIn(signIn: SignIn, code: String): Boolean {
        return when (val r = signIn.attemptFirstFactor(SignIn.AttemptFirstFactorParams.EmailCode(code = code))) {
            is ClerkResult.Success -> true
            is ClerkResult.Failure -> { _error.value = r.errorMessage(); false }
        }
    }

    private suspend fun verifyOnSignUp(signUp: SignUp, code: String): Boolean {
        return when (val r = signUp.attemptVerification(SignUp.AttemptVerificationParams.EmailCode(code = code))) {
            is ClerkResult.Success -> true
            is ClerkResult.Failure -> { _error.value = r.errorMessage(); false }
        }
    }
}

fun isValidEmail(s: String): Boolean = s.contains("@") && s.contains(".")

private fun ClerkResult.Failure<*>.errorMessage(): String {
    val err = this.error
    val msg = when (err) {
        is com.clerk.api.network.model.error.ClerkErrorResponse -> err.firstMessage()
        else -> null
    }
    return msg ?: this.throwable?.message ?: "Something went wrong"
}

/** First Clerk API error code (e.g. "form_identifier_not_found"), if any. */
private fun ClerkResult.Failure<*>.errorCode(): String? =
    (this.error as? com.clerk.api.network.model.error.ClerkErrorResponse)
        ?.errors?.firstOrNull()?.code
