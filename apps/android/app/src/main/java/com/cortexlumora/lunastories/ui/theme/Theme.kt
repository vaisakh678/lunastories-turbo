package com.cortexlumora.lunastories.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Single dark scheme — iOS app is .preferredColorScheme(.dark) globally.
private val LunaDarkColors = darkColorScheme(
    primary = Accent,
    onPrimary = MiloCream,
    background = TwilightTop,
    onBackground = MiloCream,
    surface = TwilightTop,
    onSurface = MiloCream,
)

@Composable
fun LunaStoriesTheme(content: @Composable () -> Unit) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            // System bars are transparent via enableEdgeToEdge() in MainActivity;
            // here we just force dark icons since the twilight gradient is always dark.
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = false
                isAppearanceLightNavigationBars = false
            }
        }
    }
    MaterialTheme(
        colorScheme = LunaDarkColors,
        typography = Typography,
        content = content,
    )
}
