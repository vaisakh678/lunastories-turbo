package com.cortexlumora.lunastories.audio

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.foundation.clickable
import androidx.compose.material3.IconButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_FAINT
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.MiloCream

/**
 * Bottom audio bar for the reader. Renders nothing until the file is
 * loaded and we know a duration.
 */
@Composable
fun AudioBar(
    player: StoryAudioPlayer,
    modifier: Modifier = Modifier,
) {
    val isPlaying by player.isPlaying.collectAsState()
    val position by player.positionMs.collectAsState()
    val duration by player.durationMs.collectAsState()
    val speed by player.speed.collectAsState()
    var dragging by remember { mutableStateOf<Float?>(null) }

    if (duration <= 0L) return

    val progress = dragging ?: (position.toFloat() / duration.toFloat()).coerceIn(0f, 1f)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(MiloCream.copy(alpha = 0.10f))
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(
                onClick = { player.togglePlay() },
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Accent),
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = if (isPlaying) "Pause" else "Play",
                    tint = Color.White,
                )
            }
            Spacer(Modifier.size(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Slider(
                    value = progress,
                    onValueChange = { dragging = it },
                    onValueChangeFinished = {
                        dragging?.let { p ->
                            player.seekTo((p * duration).toLong())
                        }
                        dragging = null
                    },
                    colors = SliderDefaults.colors(
                        thumbColor = Accent,
                        activeTrackColor = Accent,
                        inactiveTrackColor = MiloCream.copy(alpha = 0.2f),
                    ),
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = formatMmSs((progress * duration).toLong()),
                        color = MiloCream.copy(alpha = ALPHA_MUTED),
                        style = MaterialTheme.typography.labelSmall,
                    )
                    Text(
                        text = formatSpeed(speed),
                        color = MiloCream.copy(alpha = 0.8f),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier
                            .clip(androidx.compose.foundation.shape.RoundedCornerShape(50))
                            .background(MiloCream.copy(alpha = 0.10f))
                            .clickable { player.cycleSpeed() }
                            .padding(horizontal = 8.dp, vertical = 3.dp),
                    )
                    Text(
                        text = formatMmSs(duration),
                        color = MiloCream.copy(alpha = ALPHA_MUTED),
                        style = MaterialTheme.typography.labelSmall,
                    )
                }
            }
        }
    }
}

private fun formatSpeed(speed: Float): String =
    if (speed == speed.toInt().toFloat()) "${speed.toInt()}x" else "${"%.2f".format(speed).trimEnd('0').trimEnd('.')}x"

private fun formatMmSs(ms: Long): String {
    val total = (ms / 1000).coerceAtLeast(0)
    val m = total / 60
    val s = total % 60
    return "%d:%02d".format(m, s)
}
