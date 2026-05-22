package com.cortexlumora.lunastories.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.cortexlumora.lunastories.BundledAvatars
import java.util.UUID

private fun isAvatarId(name: String): Boolean =
    runCatching { UUID.fromString(name); true }.getOrDefault(false)

/**
 * Renders a character icon — a bundled avatar image (drawable WebP under
 * res/drawable-nodpi) when `symbolName` is a UUID, otherwise a tinted
 * Material Person fallback. Mirrors iOS CharacterIconView so the same
 * stored `symbolName` value renders consistently across platforms.
 */
@Composable
fun CharacterIconView(
    symbolName: String,
    tint: Color,
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 22.dp,
    glyphSize: Dp = 28.dp,
) {
    val ctx = LocalContext.current
    val resId = remember(symbolName) {
        if (isAvatarId(symbolName)) BundledAvatars.drawableResId(ctx, symbolName) else 0
    }

    Box(
        modifier = modifier.clip(RoundedCornerShape(cornerRadius)),
        contentAlignment = Alignment.Center,
    ) {
        if (resId != 0) {
            Image(
                painter = painterResource(resId),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(tint.copy(alpha = 0.18f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    tint = tint,
                    modifier = Modifier.size(glyphSize),
                )
            }
        }
    }
}
