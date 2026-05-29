package com.cortexlumora.lunastories.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.R
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.GlowCoral
import com.cortexlumora.lunastories.ui.theme.GlowGold
import com.cortexlumora.lunastories.ui.theme.MiloCream

@Composable
fun SplashScreen(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        MoodyTwilightBackground()

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            SplashIconArt(painterResource(R.drawable.splash_icon))

            Spacer(modifier = Modifier.height(22.dp))

            Text(
                text = "Luna Stories",
                color = MiloCream,
                style = MaterialTheme.typography.displayLarge,
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Bedtime, magical.",
                color = MiloCream.copy(alpha = ALPHA_MUTED),
                style = MaterialTheme.typography.labelMedium,
            )
        }
    }
}

@Composable
private fun SplashIconArt(painter: Painter) {
    Box(contentAlignment = Alignment.Center) {
        // Outer coral glow. Radial gradient (not Modifier.blur, which is a no-op
        // below API 31 and clips to a hard square) so the halo is a smooth circle.
        Box(
            modifier = Modifier
                .size(300.dp)
                .background(
                    Brush.radialGradient(listOf(GlowCoral.copy(alpha = 0.40f), Color.Transparent)),
                    shape = CircleShape,
                )
        )
        // Inner gold glow
        Box(
            modifier = Modifier
                .size(210.dp)
                .background(
                    Brush.radialGradient(listOf(GlowGold.copy(alpha = 0.34f), Color.Transparent)),
                    shape = CircleShape,
                )
        )
        // Icon (168dp, rounded 38)
        Image(
            painter = painter,
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(168.dp)
                .shadow(elevation = 30.dp, shape = RoundedCornerShape(38.dp))
                .clip(RoundedCornerShape(38.dp))
                .background(Color.Black),
        )
    }
}
