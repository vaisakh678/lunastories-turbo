package com.cortexlumora.lunastories.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.network.StoryResponse
import com.cortexlumora.lunastories.stories.GenerationCue
import com.cortexlumora.lunastories.stories.GenerationStatus
import com.cortexlumora.lunastories.stories.StoryGenerationManager
import com.cortexlumora.lunastories.ui.components.ColorPalette
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_FAINT
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.MiloCream
import kotlinx.coroutines.delay

private val StatusLines = listOf(
    "Picking the perfect words…",
    "Setting the scene…",
    "Adding a sprinkle of magic…",
    "Almost there…",
)

@Composable
fun GeneratingScreen(
    onCancel: () -> Unit,
    onReady: (StoryResponse) -> Unit,
    onFailed: (String) -> Unit,
) {
    val inFlight by StoryGenerationManager.inFlight.collectAsState()

    BackHandler(onBack = onCancel)
    val cues = inFlight?.cues.orEmpty().ifEmpty { listOf(GenerationCue("idle", "Cooking up your story", null, "orange")) }

    var cueIndex by remember { mutableStateOf(0) }
    var statusIndex by remember { mutableStateOf(0) }

    LaunchedEffect(cues.size) {
        while (true) {
            delay(1800)
            cueIndex = (cueIndex + 1) % cues.size
        }
    }
    LaunchedEffect(Unit) {
        while (true) {
            delay(2500)
            statusIndex = (statusIndex + 1) % StatusLines.size
        }
    }

    LaunchedEffect(inFlight?.status) {
        when (val s = inFlight?.status) {
            is GenerationStatus.Ready -> onReady(s.story)
            is GenerationStatus.Failed -> onFailed(s.message)
            else -> Unit
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        IconButton(
            onClick = onCancel,
            modifier = Modifier.align(Alignment.TopStart).padding(8.dp),
        ) { Icon(Icons.Default.Close, contentDescription = "Close", tint = MiloCream) }

        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            val cue = cues[cueIndex]
            AnimatedContent(
                targetState = cue,
                transitionSpec = {
                    (fadeIn() togetherWith fadeOut())
                },
                label = "cue-art",
            ) { c ->
                CueArt(c)
            }

            Spacer(Modifier.height(28.dp))

            Text(
                text = inFlight?.title ?: "Crafting your story",
                color = MiloCream,
                style = MaterialTheme.typography.headlineSmall,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "About 10 seconds",
                color = MiloCream.copy(alpha = ALPHA_CAPTION),
                style = MaterialTheme.typography.titleSmall,
            )

            Spacer(Modifier.height(24.dp))

            LinearProgressIndicator(
                color = Accent,
                trackColor = MiloCream.copy(alpha = 0.12f),
                modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp)),
            )

            Spacer(Modifier.height(16.dp))

            AnimatedContent(
                targetState = StatusLines[statusIndex],
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "status",
            ) { line ->
                Text(line, color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.titleSmall)
            }
        }
    }
}

@Composable
private fun CueArt(cue: GenerationCue) {
    val tint = ColorPalette.color(cue.tintName)
    Box(
        modifier = Modifier
            .size(160.dp)
            .clip(RoundedCornerShape(28.dp))
            .background(tint.copy(alpha = 0.22f))
            .border(1.dp, MiloCream.copy(alpha = 0.18f), RoundedCornerShape(28.dp)),
        contentAlignment = Alignment.Center,
    ) {
        if (cue.drawableRes != null) {
            Image(
                painter = painterResource(cue.drawableRes),
                contentDescription = cue.label,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Text(
                text = cue.label.take(2).uppercase(),
                color = tint,
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}
