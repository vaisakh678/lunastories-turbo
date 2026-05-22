package com.cortexlumora.lunastories.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.network.StoryAPI
import com.cortexlumora.lunastories.network.StoryResponse
import com.cortexlumora.lunastories.network.StoryStatus
import com.cortexlumora.lunastories.ui.components.ColorPalette
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlin.math.ceil

@Composable
fun MyStoriesScreen(
    onBack: () -> Unit,
    onOpenStory: (String) -> Unit,
) {
    var items by remember { mutableStateOf<List<StoryResponse>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        runCatching { StoryAPI.list() }
            .onSuccess { page -> items = page.items }
            .onFailure { error = it.message ?: "Couldn't load stories" }
        loading = false
    }

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MiloCream)
                }
                Text("My Stories", color = MiloCream, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }

            when {
                loading -> Centered { CircularProgressIndicator(color = Accent) }
                error != null && items.isEmpty() -> Centered {
                    Text(error!!, color = MiloCream, fontSize = 15.sp)
                }
                items.isEmpty() -> EmptyState()
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(items, key = { it.id }) { story ->
                        StoryRow(
                            story = story,
                            onTap = {
                                if (story.status == StoryStatus.ready) onOpenStory(story.id)
                            },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun Centered(content: @Composable () -> Unit) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { content() }
}

@Composable
private fun EmptyState() {
    Box(modifier = Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                Icons.AutoMirrored.Filled.MenuBook,
                contentDescription = null,
                tint = MiloCream.copy(alpha = 0.4f),
                modifier = Modifier.size(56.dp),
            )
            Spacer(Modifier.height(16.dp))
            Text("No stories yet", color = MiloCream, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(6.dp))
            Text(
                "Create your first story from the home screen.",
                color = MiloCream.copy(alpha = 0.65f),
                fontSize = 14.sp,
            )
        }
    }
}

@Composable
private fun StoryRow(story: StoryResponse, onTap: () -> Unit) {
    val tint = ColorPalette.color(story.coverTint)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MiloCream.copy(alpha = 0.06f))
            .border(1.dp, MiloCream.copy(alpha = 0.08f), RoundedCornerShape(16.dp))
            .clickable(enabled = story.status == StoryStatus.ready, onClick = onTap)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(tint.copy(alpha = 0.22f)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = story.title?.take(2)?.uppercase() ?: "✨",
                color = tint,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
            )
        }
        Spacer(Modifier.size(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = story.title ?: "Untitled story",
                color = MiloCream,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            story.summary?.let {
                Spacer(Modifier.height(2.dp))
                Text(
                    it,
                    color = MiloCream.copy(alpha = 0.65f),
                    fontSize = 13.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = metaLine(story),
                color = when (story.status) {
                    StoryStatus.failed -> Accent
                    else -> MiloCream.copy(alpha = 0.55f)
                },
                fontSize = 12.sp,
            )
        }
    }
}

private fun metaLine(story: StoryResponse): String {
    val rel = relativeTime(story.updatedAt)
    return when (story.status) {
        StoryStatus.ready -> {
            val mins = story.durationSeconds?.let { ceil(it / 60.0).toInt() } ?: 0
            val m = if (mins > 0) "$mins min · " else ""
            "$m$rel"
        }
        StoryStatus.pending -> "Queued…"
        StoryStatus.generating -> "Generating…"
        StoryStatus.failed -> "Failed"
    }
}

private fun relativeTime(iso: String?): String {
    iso ?: return ""
    return runCatching {
        val then = Instant.parse(iso)
        val now = Instant.now()
        val days = ChronoUnit.DAYS.between(then, now)
        val hours = ChronoUnit.HOURS.between(then, now)
        val mins = ChronoUnit.MINUTES.between(then, now)
        when {
            days >= 7 -> "${days / 7}w ago"
            days >= 1 -> "${days}d ago"
            hours >= 1 -> "${hours}h ago"
            mins >= 1 -> "${mins}m ago"
            else -> "Just now"
        }
    }.getOrDefault("")
}
