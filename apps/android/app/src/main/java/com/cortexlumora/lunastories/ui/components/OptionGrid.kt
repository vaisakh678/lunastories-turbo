package com.cortexlumora.lunastories.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.stories.PickOption
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream

/** Reusable option grid for type/profession/place/character pickers. */
@Composable
fun OptionGrid(
    options: List<PickOption>,
    selected: PickOption?,
    onSelect: (PickOption) -> Unit,
    modifier: Modifier = Modifier,
    columns: Int = 3,
    extraTile: (@Composable () -> Unit)? = null,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(columns),
        contentPadding = PaddingValues(vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = modifier,
    ) {
        items(options) { opt ->
            OptionTile(opt, selected = selected?.title == opt.title) { onSelect(opt) }
        }
        if (extraTile != null) {
            item { extraTile() }
        }
    }
}

@Composable
fun OptionTile(opt: PickOption, selected: Boolean, onTap: () -> Unit) {
    val borderColor = if (selected) Accent else MiloCream.copy(alpha = 0.15f)
    val borderWidth = if (selected) 3.dp else 1.dp
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onTap),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(18.dp))
                .background(opt.tint.copy(alpha = 0.18f))
                .border(borderWidth, borderColor, RoundedCornerShape(18.dp)),
            contentAlignment = Alignment.Center,
        ) {
            if (opt.drawableRes != null) {
                Image(
                    painter = painterResource(opt.drawableRes),
                    contentDescription = opt.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                )
            } else {
                Text(
                    text = opt.title,
                    color = opt.tint,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(8.dp),
                )
            }
        }
        Text(
            text = opt.title,
            color = MiloCream,
            fontSize = 11.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp),
        )
    }
}
