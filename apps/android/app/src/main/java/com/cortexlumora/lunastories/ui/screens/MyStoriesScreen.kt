package com.cortexlumora.lunastories.ui.screens

import androidx.activity.compose.BackHandler
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
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
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
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_FAINT
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.MiloCream
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlin.math.ceil
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyStoriesScreen(
    onBack: () -> Unit,
    onOpenStory: (String) -> Unit,
) {
    var items by remember { mutableStateOf<List<StoryResponse>>(emptyList()) }
    var cursor by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    var refreshing by remember { mutableStateOf(false) }
    var loadingMore by remember { mutableStateOf(false) }
    var reachedEnd by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var retryNonce by remember { mutableStateOf(0) }
    var pendingDelete by remember { mutableStateOf<StoryResponse?>(null) }
    val scope = rememberCoroutineScope()

    BackHandler(onBack = onBack)

    suspend fun loadFirstPage() {
        error = null
        runCatching { StoryAPI.list() }
            .onSuccess { page ->
                items = page.items
                cursor = page.nextCursor
                reachedEnd = page.nextCursor == null
            }
            .onFailure { error = it.message ?: "Couldn't load stories" }
    }

    suspend fun loadMore() {
        val c = cursor ?: return
        loadingMore = true
        runCatching { StoryAPI.list(cursor = c) }
            .onSuccess { page ->
                items = items + page.items
                cursor = page.nextCursor
                reachedEnd = page.nextCursor == null
            }
            .onFailure { error = it.message ?: "Couldn't load more" }
        loadingMore = false
    }

    LaunchedEffect(retryNonce) {
        loading = true
        loadFirstPage()
        loading = false
    }

    val listState = rememberLazyListState()
    val needsMore by remember {
        derivedStateOf {
            val li = listState.layoutInfo
            val last = li.visibleItemsInfo.lastOrNull()?.index ?: return@derivedStateOf false
            last >= items.size - 4 && !reachedEnd && !loadingMore && items.isNotEmpty()
        }
    }
    LaunchedEffect(needsMore) { if (needsMore) loadMore() }

    val pullState = rememberPullToRefreshState()
    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MiloCream)
                }
                Text("My Stories", color = MiloCream, style = MaterialTheme.typography.headlineSmall)
            }

            PullToRefreshBox(
                isRefreshing = refreshing,
                onRefresh = {
                    refreshing = true
                    loadingMore = false
                    reachedEnd = false
                },
                state = pullState,
                modifier = Modifier.fillMaxSize(),
            ) {
                LaunchedEffect(refreshing) {
                    if (refreshing) {
                        loadFirstPage()
                        refreshing = false
                    }
                }

                when {
                    loading -> CenteredLoader()
                    error != null && items.isEmpty() -> ErrorState(message = error!!) {
                        retryNonce += 1
                    }
                    items.isEmpty() -> EmptyState()
                    else -> LazyColumn(
                        state = listState,
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        items(items, key = { it.id }) { story ->
                            SwipeableStoryRow(
                                story = story,
                                onTap = {
                                    if (story.status == StoryStatus.ready) onOpenStory(story.id)
                                },
                                onRequestDelete = { pendingDelete = story },
                            )
                        }
                        if (loadingMore) {
                            item {
                                Box(modifier = Modifier.fillMaxWidth().padding(12.dp), contentAlignment = Alignment.Center) {
                                    CircularProgressIndicator(color = Accent, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    pendingDelete?.let { story ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("Delete this story?") },
            text = { Text(story.title ?: "Untitled story") },
            confirmButton = {
                TextButton(onClick = {
                    pendingDelete = null
                    scope.launch {
                        runCatching { StoryAPI.delete(story.id) }
                            .onSuccess { items = items.filterNot { it.id == story.id } }
                            .onFailure { error = it.message ?: "Couldn't delete story" }
                    }
                }) { Text("Delete", color = Color(0xFFFF453A)) }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = null }) { Text("Cancel") }
            },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SwipeableStoryRow(
    story: StoryResponse,
    onTap: () -> Unit,
    onRequestDelete: () -> Unit,
) {
    val dismissState = rememberSwipeToDismissBoxState(
        confirmValueChange = { target ->
            if (target == SwipeToDismissBoxValue.EndToStart || target == SwipeToDismissBoxValue.StartToEnd) {
                onRequestDelete()
            }
            false // never auto-dismiss; we keep the row visible until the user confirms
        },
    )
    SwipeToDismissBox(
        state = dismissState,
        backgroundContent = { DeleteSwipeBackground() },
    ) {
        StoryRow(story = story, onTap = onTap)
    }
}

@Composable
private fun DeleteSwipeBackground() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFFFF453A).copy(alpha = 0.85f))
            .padding(horizontal = 24.dp),
        contentAlignment = Alignment.CenterEnd,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.White)
            Spacer(Modifier.size(6.dp))
            Text("Delete", color = Color.White, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun CenteredLoader() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = Accent)
    }
}

@Composable
private fun ErrorState(message: String, onRetry: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Couldn't load stories", color = MiloCream, style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(6.dp))
            Text(message, color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = onRetry,
                shape = RoundedCornerShape(50),
                colors = ButtonDefaults.buttonColors(containerColor = Accent, contentColor = Color.White),
            ) { Text("Try again", fontWeight = FontWeight.SemiBold) }
        }
    }
}

@Composable
private fun EmptyState() {
    Box(modifier = Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                Icons.AutoMirrored.Filled.MenuBook,
                contentDescription = null,
                tint = MiloCream.copy(alpha = ALPHA_FAINT),
                modifier = Modifier.size(56.dp),
            )
            Spacer(Modifier.height(16.dp))
            Text("No stories yet", color = MiloCream, style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(6.dp))
            Text(
                "Create your first story from the home screen.",
                color = MiloCream.copy(alpha = ALPHA_MUTED),
                style = MaterialTheme.typography.titleSmall,
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
                style = MaterialTheme.typography.headlineSmall,
            )
        }
        Spacer(Modifier.size(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = story.title ?: "Untitled story",
                color = MiloCream,
                style = MaterialTheme.typography.titleMedium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            story.summary?.let {
                Spacer(Modifier.height(2.dp))
                Text(
                    it,
                    color = MiloCream.copy(alpha = ALPHA_MUTED),
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = metaLine(story),
                color = when (story.status) {
                    StoryStatus.failed -> Accent
                    else -> MiloCream.copy(alpha = ALPHA_CAPTION)
                },
                style = MaterialTheme.typography.labelSmall,
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
