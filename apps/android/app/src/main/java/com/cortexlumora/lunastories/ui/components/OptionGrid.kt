package com.cortexlumora.lunastories.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Casino
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.cortexlumora.lunastories.stories.PickOption
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.MiloCream

private val TileCorner = RoundedCornerShape(22.dp)
private val RowCorner = RoundedCornerShape(14.dp)

/**
 * Reusable 2-column option grid for image-backed pickers (type / profession /
 * place / character). Mirrors iOS OptionGrid: an optional "Surprise me" tile
 * leads, then the options, then an optional "Other…" tile.
 */
@Composable
fun OptionGrid(
    options: List<PickOption>,
    selected: PickOption?,
    onSelect: (PickOption) -> Unit,
    modifier: Modifier = Modifier,
    columns: Int = 2,
    allowSurprise: Boolean = true,
    onOther: (() -> Unit)? = null,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(columns),
        contentPadding = PaddingValues(vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = modifier,
    ) {
        if (allowSurprise && options.isNotEmpty()) {
            item { SurpriseTile { options.randomOrNull()?.let(onSelect) } }
        }
        items(options) { opt ->
            OptionTile(opt, selected = selected?.title == opt.title) { onSelect(opt) }
        }
        if (onOther != null) {
            item { OtherTile(onTap = onOther) }
        }
    }
}

@Composable
fun OptionTile(opt: PickOption, selected: Boolean, onTap: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onTap),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(TileCorner)
                .background(opt.tint.copy(alpha = 0.32f))
                .border(
                    width = if (selected) 3.dp else 1.dp,
                    color = if (selected) Accent else Color.White.copy(alpha = 0.08f),
                    shape = TileCorner,
                ),
            contentAlignment = Alignment.Center,
        ) {
            if (opt.drawableRes != null) {
                Image(
                    painter = painterResource(opt.drawableRes),
                    contentDescription = opt.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth().aspectRatio(1f).clip(TileCorner),
                )
            } else {
                Text(
                    text = opt.title,
                    color = MiloCream,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.titleSmall,
                    modifier = Modifier.padding(8.dp),
                )
            }
        }
        Text(
            text = opt.title,
            color = MiloCream,
            fontWeight = FontWeight.SemiBold,
            style = MaterialTheme.typography.labelMedium,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
        )
    }
}

/** Square tile that picks a random option — same shape as the regular tiles. */
@Composable
private fun SurpriseTile(onTap: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onTap),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(TileCorner)
                .background(
                    Brush.linearGradient(listOf(Accent, Accent.copy(alpha = 0.7f))),
                ),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Filled.Casino, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp))
        }
        Text(
            text = "Surprise me",
            color = MiloCream,
            fontWeight = FontWeight.SemiBold,
            style = MaterialTheme.typography.labelMedium,
            textAlign = TextAlign.Center,
            maxLines = 1,
            modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
        )
    }
}

/** Dashed "escape hatch" tile that opens a custom text entry. */
@Composable
private fun OtherTile(onTap: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onTap),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(TileCorner)
                .border(2.dp, MiloCream.copy(alpha = 0.35f), TileCorner),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Filled.Edit, contentDescription = null, tint = MiloCream.copy(alpha = 0.7f), modifier = Modifier.size(32.dp))
        }
        Text(
            text = "Other…",
            color = MiloCream,
            fontWeight = FontWeight.SemiBold,
            style = MaterialTheme.typography.labelMedium,
            textAlign = TextAlign.Center,
            maxLines = 1,
            modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
        )
    }
}

/**
 * Vertical list of option rows for label-only pickers (morals). Mirrors iOS
 * OptionList — a leading tinted glyph, the title, a trailing chevron — instead
 * of repeating the label inside a square tile.
 */
@Composable
fun OptionList(
    options: List<PickOption>,
    selected: PickOption?,
    onSelect: (PickOption) -> Unit,
    modifier: Modifier = Modifier,
    allowSurprise: Boolean = true,
    onOther: (() -> Unit)? = null,
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (allowSurprise && options.isNotEmpty()) {
            SurpriseRow { options.randomOrNull()?.let(onSelect) }
        }
        options.forEach { opt ->
            OptionRow(opt, selected = selected?.title == opt.title) { onSelect(opt) }
        }
        if (onOther != null) OtherRow(onTap = onOther)
    }
}

@Composable
private fun OptionRow(opt: PickOption, selected: Boolean, onTap: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RowCorner)
            .background(if (selected) Accent.copy(alpha = 0.16f) else MiloCream.copy(alpha = 0.06f))
            .border(
                width = if (selected) 1.5.dp else 1.dp,
                color = if (selected) Accent else MiloCream.copy(alpha = 0.10f),
                shape = RowCorner,
            )
            .clickable(onClick = onTap)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(
            modifier = Modifier.size(40.dp).clip(CircleShape).background(opt.tint.copy(alpha = 0.85f)),
        )
        Text(
            text = opt.title,
            color = MiloCream,
            fontWeight = FontWeight.Medium,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f),
        )
        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = MiloCream.copy(alpha = ALPHA_MUTED),
            modifier = Modifier.size(20.dp),
        )
    }
}

@Composable
private fun SurpriseRow(onTap: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RowCorner)
            .background(Accent.copy(alpha = 0.12f))
            .clickable(onClick = onTap)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(Brush.linearGradient(listOf(Accent, Accent.copy(alpha = 0.7f)))),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Filled.Casino, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
        }
        Text("Surprise me", color = MiloCream, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_MUTED), modifier = Modifier.size(20.dp))
    }
}

@Composable
private fun OtherRow(onTap: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RowCorner)
            .background(MiloCream.copy(alpha = 0.04f))
            .clickable(onClick = onTap)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(
            modifier = Modifier.size(40.dp).clip(CircleShape).border(2.dp, MiloCream.copy(alpha = 0.35f), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Filled.Edit, contentDescription = null, tint = MiloCream.copy(alpha = 0.7f), modifier = Modifier.size(18.dp))
        }
        Text("Other…", color = MiloCream, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_MUTED), modifier = Modifier.size(20.dp))
    }
}

/** "Step X of Y" pill shown in step headers. Mirrors iOS StepBadge. */
@Composable
fun StepBadge(text: String) {
    Text(
        text = text,
        color = Accent,
        fontWeight = FontWeight.SemiBold,
        style = MaterialTheme.typography.labelMedium,
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(Accent.copy(alpha = 0.12f))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    )
}

/** Header for per-character steps: step badge, the child's avatar, name, prompt. */
@Composable
fun CharacterStepHeader(
    name: String,
    symbolName: String,
    tint: Color,
    title: String,
    stepLabel: String?,
) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        if (stepLabel != null) StepBadge(stepLabel)
        CharacterIconView(
            symbolName = symbolName,
            tint = tint,
            cornerRadius = 32.dp,
            glyphSize = 28.dp,
            modifier = Modifier.size(64.dp),
        )
        Text(name, color = MiloCream, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleMedium)
        Text(title, color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.bodyMedium)
    }
}

/** Header for non-character steps: step badge, bold title, optional subtitle. */
@Composable
fun PlainStepHeader(
    title: String,
    subtitle: String? = null,
    stepLabel: String? = null,
) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        if (stepLabel != null) {
            StepBadge(stepLabel)
            Spacer(Modifier.height(2.dp))
        }
        Text(title, color = MiloCream, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
        if (subtitle != null) {
            Text(subtitle, color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
        }
    }
}
