package com.cortexlumora.lunastories.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.cortexlumora.lunastories.network.CoverIcon

/**
 * A story cover that collages the story's characters (1–4 of them) into the
 * cover square/rect. Falls back to a tinted book glyph when a story has no
 * characters. Used by the My Stories list card and the reader hero. Tiles use
 * [CharacterIconView] so bundled avatar images render. The caller owns the
 * outer frame + corner clipping. Mirrors iOS StoryCoverGrid.
 */
@Composable
fun StoryCoverGrid(
    icons: List<CoverIcon>,
    tint: Color,
    modifier: Modifier = Modifier,
    glyphSize: Dp = 28.dp,
) {
    val capped = icons.take(4)
    val gap = 2.dp

    Box(modifier = modifier.fillMaxSize()) {
        if (capped.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(tint.copy(alpha = 0.18f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.MenuBook,
                    contentDescription = null,
                    tint = tint,
                    modifier = Modifier.size(glyphSize * 1.5f),
                )
            }
        } else {
            when (capped.size) {
                1 -> Tile(capped[0], glyphSize, Modifier.fillMaxSize())
                2 -> Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(gap)) {
                    Tile(capped[0], glyphSize, Modifier.weight(1f).fillMaxSize())
                    Tile(capped[1], glyphSize, Modifier.weight(1f).fillMaxSize())
                }
                3 -> Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(gap)) {
                    Tile(capped[0], glyphSize, Modifier.weight(1f).fillMaxSize())
                    Column(Modifier.weight(1f).fillMaxSize(), verticalArrangement = Arrangement.spacedBy(gap)) {
                        Tile(capped[1], glyphSize, Modifier.weight(1f).fillMaxSize())
                        Tile(capped[2], glyphSize, Modifier.weight(1f).fillMaxSize())
                    }
                }
                else -> Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(gap)) {
                    Row(Modifier.weight(1f).fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(gap)) {
                        Tile(capped[0], glyphSize, Modifier.weight(1f).fillMaxSize())
                        Tile(capped[1], glyphSize, Modifier.weight(1f).fillMaxSize())
                    }
                    Row(Modifier.weight(1f).fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(gap)) {
                        Tile(capped[2], glyphSize, Modifier.weight(1f).fillMaxSize())
                        Tile(capped[3], glyphSize, Modifier.weight(1f).fillMaxSize())
                    }
                }
            }
        }
    }
}

@Composable
private fun Tile(icon: CoverIcon, glyphSize: Dp, modifier: Modifier) {
    CharacterIconView(
        symbolName = icon.symbolName,
        tint = ColorPalette.color(icon.tint),
        modifier = modifier,
        cornerRadius = 0.dp,
        glyphSize = glyphSize,
    )
}
