package com.cortexlumora.lunastories.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.R
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.GlowCoral
import com.cortexlumora.lunastories.ui.theme.GlowGold
import com.cortexlumora.lunastories.ui.theme.MiloCream

/**
 * Entry to auth — mirrors iOS GetStartedView. CTAs open the custom
 * ProviderSheet in either sign-in or sign-up mode.
 */
@Composable
fun GetStartedScreen(
    onStartSignUp: () -> Unit,
    onSignIn: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier.fillMaxSize(),
    ) {
        MoodyTwilightBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .padding(top = 80.dp, bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(modifier = Modifier.weight(1f))

            HeroIcon()

            Spacer(modifier = Modifier.height(36.dp))

            // Brand pill — small touch of personality above the title.
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .background(Accent.copy(alpha = 0.16f))
                    .border(1.dp, Accent.copy(alpha = 0.5f), RoundedCornerShape(50))
                    .padding(horizontal = 12.dp, vertical = 5.dp),
            ) {
                Text(
                    text = "LUNA STORIES",
                    color = Accent,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp,
                    ),
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Bedtime stories,\nmade just for them",
                color = MiloCream,
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold,
                    lineHeight = 38.sp,
                ),
                textAlign = TextAlign.Center,
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Personalized tales your little one will\nask for night after night.",
                color = MiloCream.copy(alpha = ALPHA_MUTED),
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
            )

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = onStartSignUp,
                shape = RoundedCornerShape(50),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Accent,
                    contentColor = Color.White,
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .shadow(14.dp, RoundedCornerShape(50), spotColor = GlowCoral),
            ) {
                Text(
                    text = "Get Started",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Single centered row so the prompt + link never wrap awkwardly.
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Already have an account?",
                    color = MiloCream.copy(alpha = ALPHA_MUTED),
                    style = MaterialTheme.typography.labelMedium,
                )
                TextButton(onClick = onSignIn) {
                    Text(
                        text = "Sign in",
                        color = Accent,
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    )
                }
            }
        }
    }
}

@Composable
private fun HeroIcon() {
    Box(contentAlignment = Alignment.Center) {
        // Warm twilight glow behind the icon, matching the splash + paywall hero.
        // Radial gradient (not Modifier.blur) so it's a smooth circle everywhere.
        Box(
            modifier = Modifier
                .size(260.dp)
                .background(
                    Brush.radialGradient(listOf(GlowCoral.copy(alpha = 0.38f), Color.Transparent)),
                    shape = CircleShape,
                ),
        )
        Box(
            modifier = Modifier
                .size(190.dp)
                .background(
                    Brush.radialGradient(listOf(GlowGold.copy(alpha = 0.30f), Color.Transparent)),
                    shape = CircleShape,
                ),
        )
        Image(
            painter = painterResource(R.drawable.splash_icon),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(160.dp)
                .shadow(22.dp, RoundedCornerShape(40.dp), spotColor = GlowCoral)
                .clip(RoundedCornerShape(40.dp))
                .border(1.dp, MiloCream.copy(alpha = 0.14f), RoundedCornerShape(40.dp)),
        )
    }
}
