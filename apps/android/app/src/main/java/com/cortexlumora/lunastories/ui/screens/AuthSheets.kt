package com.cortexlumora.lunastories.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Pin
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLinkStyles
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withLink
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.LegalLinks
import com.cortexlumora.lunastories.R
import com.cortexlumora.lunastories.auth.AuthMode
import com.cortexlumora.lunastories.auth.AuthProviderKind
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_FAINT
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.MiloCream

// ─────────────────────────────────────────────────────────────────────
// Provider sheet
// ─────────────────────────────────────────────────────────────────────

@Composable
fun ProviderSheet(
    mode: AuthMode,
    loadingProvider: AuthProviderKind?,
    onClose: () -> Unit,
    onPickGoogle: () -> Unit,
    onPickEmail: () -> Unit,
) {
    BackHandler(onBack = onClose)
    val (title, subtitle) = when (mode) {
        AuthMode.SignIn -> "Welcome Back" to "Sign in to access your stories\nand keep the magic going."
        AuthMode.SignUp -> "Get Started" to "Continue to sign up and start\nbuilding your bedtime stories."
    }

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(
            modifier = Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(horizontal = 24.dp),
        ) {
            CloseRow(onClose)
            Spacer(Modifier.height(8.dp))
            Text(title, color = MiloCream, style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(10.dp))
            Text(
                subtitle,
                color = MiloCream.copy(alpha = ALPHA_MUTED),
                style = MaterialTheme.typography.labelMedium,
            )
            Spacer(Modifier.height(28.dp))

            ProviderButton(
                label = "Continue with Google",
                background = MiloCream.copy(alpha = 0.95f),
                textColor = Color(0xFF1F1F1F),
                logo = { Image(painter = painterResource(R.drawable.google_logo), contentDescription = null, modifier = Modifier.size(20.dp), contentScale = ContentScale.Fit) },
                loading = loadingProvider == AuthProviderKind.Google,
                enabled = loadingProvider == null,
                onClick = onPickGoogle,
            )

            Spacer(Modifier.height(18.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.weight(1f).height(1.dp).background(MiloCream.copy(alpha = 0.15f)))
                Text("or", color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(horizontal = 10.dp))
                Box(modifier = Modifier.weight(1f).height(1.dp).background(MiloCream.copy(alpha = 0.15f)))
            }

            Spacer(Modifier.height(18.dp))

            ProviderButton(
                label = "Continue with Email",
                background = MiloCream.copy(alpha = 0.95f),
                textColor = Color(0xFF1F1F1F),
                logo = { Icon(Icons.Default.Email, contentDescription = null, tint = Color(0xFF1F1F1F), modifier = Modifier.size(18.dp)) },
                loading = loadingProvider == AuthProviderKind.Email,
                enabled = loadingProvider == null,
                onClick = onPickEmail,
            )

            Spacer(Modifier.weight(1f))
            TermsFooter()
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun ProviderButton(
    label: String,
    background: Color,
    textColor: Color,
    logo: @Composable () -> Unit,
    loading: Boolean,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(50),
        colors = ButtonDefaults.buttonColors(
            containerColor = background,
            contentColor = textColor,
            disabledContainerColor = background.copy(alpha = ALPHA_FAINT),
            disabledContentColor = textColor.copy(alpha = ALPHA_MUTED),
        ),
        modifier = Modifier.fillMaxWidth().height(52.dp),
    ) {
        if (loading) {
            CircularProgressIndicator(color = textColor, strokeWidth = 2.dp, modifier = Modifier.size(18.dp))
        } else {
            logo()
            Spacer(Modifier.size(10.dp))
            Text(label, style = MaterialTheme.typography.titleMedium)
        }
    }
}

@Composable
private fun TermsFooter() {
    val linkStyle = TextLinkStyles(style = SpanStyle(color = Color(0xFF60A5FA)))
    val text = buildAnnotatedString {
        append("By continuing you agree to Luna Stories's ")
        withLink(LinkAnnotation.Url(LegalLinks.TERMS_URL, styles = linkStyle)) {
            append("Terms & Conditions")
        }
        append(" and ")
        withLink(LinkAnnotation.Url(LegalLinks.PRIVACY_URL, styles = linkStyle)) {
            append("Privacy Policy")
        }
        append(".")
    }
    Text(
        text = text,
        color = MiloCream.copy(alpha = ALPHA_MUTED),
        style = MaterialTheme.typography.labelSmall,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp),
        lineHeight = 18.sp,
    )
}

@Composable
private fun CloseRow(onClose: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().padding(top = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        // Offset the IconButton -12.dp so the visible icon's left edge lines up
        // with the column's 24.dp content padding (IconButton ships a 48.dp
        // touch target with the 24.dp icon centered, so the icon is 12.dp inset).
        IconButton(onClick = onClose, modifier = Modifier.offset(x = (-12).dp)) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = MiloCream)
        }
        Spacer(Modifier.weight(1f))
    }
}

// ─────────────────────────────────────────────────────────────────────
// Email sheet
// ─────────────────────────────────────────────────────────────────────

@Composable
fun EmailSheet(
    isSubmitting: Boolean,
    onClose: () -> Unit,
    onSubmit: (String) -> Unit,
) {
    BackHandler(onBack = onClose)
    var email by remember { mutableStateOf("") }
    val isValid = com.cortexlumora.lunastories.auth.isValidEmail(email.trim())

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(
            modifier = Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(horizontal = 24.dp),
        ) {
            CloseRow(onClose)
            Spacer(Modifier.height(8.dp))
            Text("Enter your email", color = MiloCream, style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(10.dp))
            Text(
                "We'll send you a 6-digit code to sign in.",
                color = MiloCream.copy(alpha = ALPHA_MUTED),
                style = MaterialTheme.typography.labelMedium,
            )
            Spacer(Modifier.height(28.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                placeholder = { Text("Email address", color = MiloCream.copy(alpha = ALPHA_FAINT)) },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_MUTED)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                shape = RoundedCornerShape(14.dp),
                colors = TextFieldDefaults.colors(
                    focusedTextColor = MiloCream,
                    unfocusedTextColor = MiloCream,
                    focusedContainerColor = MiloCream.copy(alpha = 0.08f),
                    unfocusedContainerColor = MiloCream.copy(alpha = 0.08f),
                    focusedIndicatorColor = Accent,
                    unfocusedIndicatorColor = MiloCream.copy(alpha = 0.18f),
                    cursorColor = Accent,
                ),
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(20.dp))

            Button(
                onClick = { onSubmit(email.trim()) },
                enabled = isValid && !isSubmitting,
                shape = RoundedCornerShape(50),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Accent,
                    contentColor = Color.White,
                    disabledContainerColor = Accent.copy(alpha = ALPHA_CAPTION),
                ),
                modifier = Modifier.fillMaxWidth().height(52.dp),
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(color = Color.White, strokeWidth = 2.dp, modifier = Modifier.size(18.dp))
                } else {
                    Text("Continue", style = MaterialTheme.typography.titleMedium)
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────
// OTP sheet
// ─────────────────────────────────────────────────────────────────────

@Composable
fun OtpSheet(
    email: String,
    isSubmitting: Boolean,
    onClose: () -> Unit,
    onVerify: (String) -> Unit,
    onResend: () -> Unit,
) {
    BackHandler(onBack = onClose)
    var code by remember { mutableStateOf("") }

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(
            modifier = Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(horizontal = 24.dp),
        ) {
            CloseRow(onClose)
            Spacer(Modifier.height(8.dp))
            Box(
                modifier = Modifier.size(56.dp).clip(CircleShape).background(Accent.copy(alpha = 0.18f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.Email, contentDescription = null, tint = Accent, modifier = Modifier.size(26.dp))
            }
            Spacer(Modifier.height(14.dp))
            Text("Check your email", color = MiloCream, style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(8.dp))
            val sub = buildAnnotatedString {
                withStyle(SpanStyle(color = MiloCream.copy(alpha = ALPHA_MUTED))) { append("We sent a 6-digit code to ") }
                withStyle(SpanStyle(color = MiloCream, fontWeight = FontWeight.SemiBold)) { append(email) }
            }
            Text(sub, style = MaterialTheme.typography.labelMedium, lineHeight = 22.sp)

            Spacer(Modifier.height(24.dp))

            OutlinedTextField(
                value = code,
                onValueChange = { raw -> code = raw.filter { it.isDigit() }.take(6) },
                placeholder = { Text("Enter 6-digit code", color = MiloCream.copy(alpha = ALPHA_FAINT)) },
                leadingIcon = { Icon(Icons.Default.Pin, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_MUTED)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                shape = RoundedCornerShape(14.dp),
                colors = TextFieldDefaults.colors(
                    focusedTextColor = MiloCream,
                    unfocusedTextColor = MiloCream,
                    focusedContainerColor = MiloCream.copy(alpha = 0.08f),
                    unfocusedContainerColor = MiloCream.copy(alpha = 0.08f),
                    focusedIndicatorColor = Accent,
                    unfocusedIndicatorColor = MiloCream.copy(alpha = 0.18f),
                    cursorColor = Accent,
                ),
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(20.dp))

            Button(
                onClick = { onVerify(code) },
                enabled = code.length == 6 && !isSubmitting,
                shape = RoundedCornerShape(50),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Accent,
                    contentColor = Color.White,
                    disabledContainerColor = Accent.copy(alpha = ALPHA_CAPTION),
                ),
                modifier = Modifier.fillMaxWidth().height(52.dp),
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(color = Color.White, strokeWidth = 2.dp, modifier = Modifier.size(18.dp))
                } else {
                    Text("Verify", style = MaterialTheme.typography.titleMedium)
                }
            }

            Spacer(Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Didn't receive a code? ", color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.titleSmall)
                Text(
                    "Resend",
                    color = Accent,
                    style = MaterialTheme.typography.titleSmall,
                    modifier = Modifier.clickable(enabled = !isSubmitting, onClick = onResend),
                )
            }
        }
    }
}
