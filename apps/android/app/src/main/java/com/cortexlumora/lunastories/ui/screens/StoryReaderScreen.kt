package com.cortexlumora.lunastories.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import android.content.Intent
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.audio.AudioBar
import com.cortexlumora.lunastories.audio.StoryAudioPlayer
import com.cortexlumora.lunastories.network.StoryAPI
import com.cortexlumora.lunastories.network.StoryResponse
import com.cortexlumora.lunastories.network.StoryStatus
import com.cortexlumora.lunastories.network.UsageAPI
import com.cortexlumora.lunastories.ui.components.ToastCenter
import com.cortexlumora.lunastories.ui.components.ToastStyle
import com.cortexlumora.lunastories.stories.GenerationCue
import com.cortexlumora.lunastories.stories.StoryGenerationManager
import com.cortexlumora.lunastories.stories.StoryInputPayload
import com.cortexlumora.lunastories.stories.StoryModes
import com.cortexlumora.lunastories.ui.components.ColorPalette
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.components.StoryCoverGrid
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_FAINT
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.MiloCream
import com.cortexlumora.lunastories.ui.theme.MiloInk
import com.cortexlumora.lunastories.ui.theme.MiloPaper

@Composable
fun StoryReaderScreen(
    storyId: String,
    onBack: () -> Unit,
    onRegenerate: () -> Unit,
) {
    var story by remember { mutableStateOf<StoryResponse?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    var generatingAudio by remember { mutableStateOf(false) }
    val ctx = LocalContext.current
    val player = remember { StoryAudioPlayer(ctx) }
    val scope = rememberCoroutineScope()

    BackHandler(onBack = onBack)

    DisposableEffect(Unit) {
        onDispose { player.release() }
    }

    LaunchedEffect(storyId) {
        loading = true
        error = null
        runCatching { StoryAPI.get(storyId) }
            .onSuccess { story = it }
            .onFailure { error = it.message ?: "Couldn't load story" }
        loading = false
        // Stamp this story as opened (idempotent on the server). Fire and
        // forget — a failed mark shouldn't disrupt reading. Mirrors iOS.
        if (story != null) {
            launch { runCatching { StoryAPI.markAsRead(storyId) } }
        }
    }

    LaunchedEffect(story?.audio?.url) {
        story?.audio?.url?.let { player.loadIfNeeded(it) }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(8.dp),
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MiloCream)
                }
                Spacer(modifier = Modifier.weight(1f))
                story?.takeIf { it.status == StoryStatus.ready }?.let { s ->
                    IconButton(onClick = { shareStory(ctx, s) }) {
                        Icon(Icons.Default.Share, contentDescription = "Share", tint = MiloCream)
                    }
                }
            }

            when {
                loading -> CenteredLoader()
                story == null -> CenteredMessage(error ?: "Couldn't load story")
                story!!.status == StoryStatus.failed -> CenteredMessage(
                    story!!.errorMessage ?: "Couldn't generate this story",
                )
                story!!.status != StoryStatus.ready -> CenteredMessage("Still preparing this story…")
                else -> ReaderBody(
                    story = story!!,
                    onMakeAnother = {
                        regenerate(story!!)
                        onRegenerate()
                    },
                )
            }
        }

        story?.takeIf { it.status == StoryStatus.ready }?.let { s ->
            Box(modifier = Modifier.align(Alignment.BottomCenter)) {
                if (s.audio != null) {
                    AudioBar(player = player)
                } else {
                    GenerateAudioBar(
                        generating = generatingAudio,
                        onClick = {
                            if (generatingAudio) return@GenerateAudioBar
                            generatingAudio = true
                            scope.launch {
                                runCatching { StoryAPI.generateAudio(s.id) }
                                    .onSuccess { updated ->
                                        story = updated
                                        // Narration just landed — refresh usage and warn once
                                        // weekly audio crosses 80% (but isn't fully spent).
                                        runCatching { UsageAPI.fetch() }.getOrNull()?.audio?.let { a ->
                                            if (a.percentUsed >= 80 && a.remaining > 0) {
                                                ToastCenter.show(
                                                    message = a.message,
                                                    title = "Running low on audio",
                                                    style = ToastStyle.Warning,
                                                    progress = a.percentUsed / 100f,
                                                    durationMs = 5_000,
                                                )
                                            }
                                        }
                                    }
                                    .onFailure {
                                        ToastCenter.show(
                                            message = it.message ?: "Couldn't generate audio",
                                            title = "Audio generation failed",
                                            style = ToastStyle.Error,
                                        )
                                    }
                                generatingAudio = false
                            }
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun GenerateAudioBar(generating: Boolean, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 24.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Button(
            onClick = onClick,
            enabled = !generating,
            shape = RoundedCornerShape(50),
            colors = ButtonDefaults.buttonColors(
                containerColor = Accent,
                contentColor = Color.White,
                disabledContainerColor = Accent.copy(alpha = 0.5f),
                disabledContentColor = Color.White,
            ),
            modifier = Modifier.fillMaxWidth().height(56.dp),
        ) {
            if (generating) {
                CircularProgressIndicator(
                    color = Color.White,
                    strokeWidth = 2.dp,
                    modifier = Modifier.size(18.dp),
                )
                Spacer(Modifier.width(10.dp))
                Text("Generating audio…", fontWeight = FontWeight.SemiBold)
            } else {
                Icon(Icons.Filled.GraphicEq, contentDescription = null)
                Spacer(Modifier.width(10.dp))
                Text("Generate Audio", fontWeight = FontWeight.SemiBold)
            }
        }
        if (!generating) {
            Spacer(Modifier.height(8.dp))
            Text(
                "Takes about 10–15 seconds.",
                color = MiloCream.copy(alpha = ALPHA_MUTED),
                style = MaterialTheme.typography.labelSmall,
            )
        }
    }
}

private fun regenerate(story: StoryResponse) {
    val ids = story.characterIds.orEmpty()
    val input = story.generationInput ?: return
    val mode = StoryModes.firstOrNull { it.modeKey == story.modeKey }
    val cues = listOfNotNull(
        mode?.let { GenerationCue("mode", it.title, it.heroRes, it.tintName) },
    ).ifEmpty {
        listOf(GenerationCue("idle", story.title ?: "Cooking up your story", null, story.coverTint ?: "orange"))
    }
    StoryGenerationManager.start(
        payload = StoryInputPayload(story.modeKey, ids, input),
        title = story.title ?: "Make another",
        cues = cues,
    )
}

@Composable
private fun ReaderBody(story: StoryResponse, onMakeAnother: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
    ) {
        val coverTint = ColorPalette.color(story.coverTint)
        StoryCoverGrid(
            icons = story.coverIcons.orEmpty(),
            tint = coverTint,
            glyphSize = 48.dp,
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp)
                .clip(RoundedCornerShape(28.dp)),
        )

        Spacer(Modifier.height(16.dp))
        story.title?.let {
            Text(it, color = MiloCream, style = MaterialTheme.typography.headlineMedium)
        }
        story.summary?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.labelMedium, lineHeight = 22.sp)
        }

        Spacer(Modifier.height(20.dp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(MiloPaper)
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            val blocks = story.content?.blocks
            if (!blocks.isNullOrEmpty()) {
                blocks.forEach { block ->
                    when (block.type) {
                        "text" -> Text(
                            text = block.text.orEmpty(),
                            color = MiloInk,
                            style = MaterialTheme.typography.bodyLarge,
                        )
                        "illustration" -> {
                            val tint = ColorPalette.color(block.tint)
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(120.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(tint.copy(alpha = 0.20f)),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(text = block.symbol ?: "✦", color = tint, fontSize = 36.sp)
                            }
                        }
                        else -> Unit
                    }
                }
            } else if (!story.bodyText.isNullOrBlank()) {
                Text(story.bodyText, color = MiloInk, style = MaterialTheme.typography.titleLarge, lineHeight = 28.sp)
            } else {
                Text("This story has no content yet.", color = MiloInk.copy(alpha = ALPHA_MUTED))
            }
        }

        Spacer(Modifier.height(20.dp))

        if (story.generationInput != null && !story.characterIds.isNullOrEmpty()) {
            Button(
                onClick = onMakeAnother,
                shape = RoundedCornerShape(50),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Accent,
                    contentColor = Color.White,
                ),
                modifier = Modifier.fillMaxWidth().height(52.dp),
            ) {
                Text("Make Another", fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(Modifier.height(140.dp))
    }
}

private fun shareStory(context: android.content.Context, story: StoryResponse) {
    val title = story.title ?: "A Luna Stories story"
    val summary = story.summary?.let { "\n\n$it" } ?: ""
    val body = story.bodyText
        ?: story.content?.blocks?.filter { it.type == "text" }?.joinToString("\n\n") { it.text.orEmpty() }
        ?: ""
    val text = buildString {
        append(title)
        append(summary)
        if (body.isNotBlank()) {
            append("\n\n")
            append(body)
        }
    }
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, title)
        putExtra(Intent.EXTRA_TEXT, text)
    }
    context.startActivity(Intent.createChooser(intent, "Share story"))
}

@Composable
private fun CenteredLoader() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = Accent)
    }
}

@Composable
private fun CenteredMessage(text: String) {
    Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Text(text, color = MiloCream, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
    }
}
