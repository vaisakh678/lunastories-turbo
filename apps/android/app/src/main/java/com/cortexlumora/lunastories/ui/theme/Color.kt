package com.cortexlumora.lunastories.ui.theme

import androidx.compose.ui.graphics.Color

// iOS AccentColor.colorset (dark variant — we always run dark)
val Accent = Color(0xFFF06A4A)
val AccentLight = Color(0xFFE85A3D)

// iOS SplashBackground.colorset
val SplashBackground = Color(0xFF1A1240)

// MoodyTwilight linear gradient stops (from SharedComponents.swift)
val TwilightTop = Color(0xFF1A1240)
val TwilightMid = Color(0xFF291B5C)
val TwilightBottom = Color(0xFF0F0A29)

// MoodyTwilight radial glow tints
val GlowGold = Color(0xFFF6BA42)
val GlowCoral = Color(0xFFE85A3D)
val GlowPurple = Color(0xFF6B49A3)

// Brand named colors (from SharedComponents.swift)
val MiloCream = Color(0xFFF7F5EE)
val MiloPaper = Color(0xFFFAF3E3)
val MiloInk = Color(0xFF281C38)

// Standard alpha tokens for text on dark backgrounds. Use these instead
// of ad-hoc 0.6/0.65/0.7/0.75 values so "muted" looks the same across
// every screen.
const val ALPHA_MUTED = 0.65f      // subtitles, descriptive secondary text
const val ALPHA_CAPTION = 0.55f    // captions, timestamps, status meta
const val ALPHA_FAINT = 0.4f       // placeholders, disabled-looking text
