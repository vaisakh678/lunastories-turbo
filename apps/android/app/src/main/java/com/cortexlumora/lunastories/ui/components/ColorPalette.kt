package com.cortexlumora.lunastories.ui.components

import androidx.compose.ui.graphics.Color
import com.cortexlumora.lunastories.ui.theme.Accent

/**
 * Maps the lowercase tint / palette names stored on Character (orange,
 * blue, gray, …) to a Color. Mirrors the iOS `ColorPalette.color(for:)`
 * helper so character tints render the same on both platforms.
 */
object ColorPalette {
    fun color(name: String?): Color = when (name?.lowercase()) {
        "orange" -> Color(0xFFFF9500)
        "yellow" -> Color(0xFFFFCC00)
        "red" -> Color(0xFFFF3B30)
        "pink" -> Color(0xFFFF2D55)
        "purple" -> Color(0xFFAF52DE)
        "indigo" -> Color(0xFF5856D6)
        "blue" -> Color(0xFF007AFF)
        "cyan" -> Color(0xFF32ADE6)
        "teal" -> Color(0xFF30B0C7)
        "mint" -> Color(0xFF00C7BE)
        "green" -> Color(0xFF34C759)
        "brown" -> Color(0xFFA2845E)
        "gray" -> Color(0xFF8E8E93)
        "black" -> Color(0xFF000000)
        "white" -> Color(0xFFFFFFFF)
        "hazel" -> Color(0xFFE6A85C)
        "blonde" -> Color(0xFFE9C46A)
        else -> Accent
    }
}
