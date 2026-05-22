package com.cortexlumora.lunastories.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.graphicsLayer
import com.cortexlumora.lunastories.ui.theme.GlowCoral
import com.cortexlumora.lunastories.ui.theme.GlowGold
import com.cortexlumora.lunastories.ui.theme.GlowPurple
import com.cortexlumora.lunastories.ui.theme.TwilightBottom
import com.cortexlumora.lunastories.ui.theme.TwilightMid
import com.cortexlumora.lunastories.ui.theme.TwilightTop

/**
 * Three-stop vertical violet gradient with three additively-blended radial glows
 * (gold top-right, coral upper-left, purple bottom-center). Mirrors the iOS
 * MoodyTwilightBackground used app-wide for splash / onboarding / paywall.
 */
@Composable
fun MoodyTwilightBackground(modifier: Modifier = Modifier) {
    Canvas(
        modifier = modifier
            .fillMaxSize()
            .graphicsLayer { compositingStrategy = CompositingStrategy.Offscreen }
    ) {
        val w = size.width
        val h = size.height

        // Base linear gradient (top → mid → bottom)
        drawRect(
            brush = Brush.verticalGradient(
                0f to TwilightTop,
                0.5f to TwilightMid,
                1f to TwilightBottom,
            ),
            size = size,
        )

        // Gold glow (top-right area). iOS uses point 85%/5% with radius 380pt.
        drawRect(
            brush = Brush.radialGradient(
                0f to GlowGold.copy(alpha = 0.32f),
                1f to Color.Transparent,
                center = Offset(w * 0.85f, h * 0.05f),
                radius = w * 0.95f,
            ),
            size = size,
            blendMode = BlendMode.Screen,
        )

        // Coral glow (upper-left). iOS uses point 5%/32% with radius 360pt.
        drawRect(
            brush = Brush.radialGradient(
                0f to GlowCoral.copy(alpha = 0.30f),
                1f to Color.Transparent,
                center = Offset(w * 0.05f, h * 0.32f),
                radius = w * 0.90f,
            ),
            size = size,
            blendMode = BlendMode.Screen,
        )

        // Purple glow (bottom-center). iOS uses point 50%/105% with radius 460pt.
        drawRect(
            brush = Brush.radialGradient(
                0f to GlowPurple.copy(alpha = 0.35f),
                1f to Color.Transparent,
                center = Offset(w * 0.5f, h * 1.05f),
                radius = w * 1.15f,
            ),
            size = size,
            blendMode = BlendMode.Screen,
        )
    }
}
