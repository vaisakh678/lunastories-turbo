package com.cortexlumora.lunastories.ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyGridScope
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.clerk.api.Clerk
import com.cortexlumora.lunastories.network.CharacterResponse
import com.cortexlumora.lunastories.network.CharacterRole
import com.cortexlumora.lunastories.stories.GenerationStatus
import com.cortexlumora.lunastories.stories.StoryGenerationManager
import com.cortexlumora.lunastories.ui.components.CharacterIconView
import com.cortexlumora.lunastories.ui.components.ColorPalette
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream
import com.cortexlumora.lunastories.viewmodels.CharactersViewModel
import com.cortexlumora.lunastories.viewmodels.LatestStoryViewModel
import com.cortexlumora.lunastories.network.StoryResponse
import com.cortexlumora.lunastories.network.StoryStatus
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    onOpenWizard: (role: CharacterRole, existing: CharacterResponse?) -> Unit,
    onStartFlow: (selected: List<CharacterResponse>) -> Unit,
    onOpenStory: (storyId: String) -> Unit,
    modifier: Modifier = Modifier,
    vm: CharactersViewModel = viewModel(),
    latestVm: LatestStoryViewModel = viewModel(),
) {
    val characters by vm.characters.collectAsState()
    val isFetching by vm.isFetching.collectAsState()
    val error by vm.error.collectAsState()
    val scope = rememberCoroutineScope()
    val inFlight by StoryGenerationManager.inFlight.collectAsState()
    val latest by latestVm.story.collectAsState()
    var pendingDelete by remember { mutableStateOf<CharacterResponse?>(null) }
    var selectedIds by remember { mutableStateOf<Set<String>>(emptySet()) }

    LaunchedEffect(Unit) { vm.load() }
    LaunchedEffect(inFlight) { if (inFlight == null) latestVm.refreshNow() }

    val main = characters.filter { it.role == CharacterRole.main }
    val side = characters.filter { it.role == CharacterRole.side }
    val selected = characters.filter { it.id in selectedIds }

    Box(modifier = modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            HomeTopBar(onSignOut = { scope.launch { Clerk.auth.signOut() } })

            // Banner: prefer in-flight; otherwise show latest-active.
            val gen = inFlight
            if (gen != null) {
                GenerationBanner(
                    title = gen.title,
                    status = gen.status,
                    onTapReady = { storyId ->
                        StoryGenerationManager.acknowledge()
                        onOpenStory(storyId)
                    },
                    onDismissFailed = { StoryGenerationManager.acknowledge() },
                )
            } else {
                latest?.let { story ->
                    LatestStoryBanner(
                        story = story,
                        onTap = {
                            latestVm.consume(story.id)
                            onOpenStory(story.id)
                        },
                        onDismiss = { latestVm.dismiss(story.id) },
                    )
                }
            }

            if (vm.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Accent)
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f),
                ) {
                    sectionHeader("Main Characters")
                    items(main, key = { it.id }) { char ->
                        CharacterCard(
                            character = char,
                            selected = char.id in selectedIds,
                            onTap = { selectedIds = selectedIds.toggle(char.id) },
                            onLongPress = { onOpenWizard(CharacterRole.main, char) },
                        )
                    }
                    item { AddTile { onOpenWizard(CharacterRole.main, null) } }

                    sectionHeader("Side Characters")
                    items(side, key = { it.id }) { char ->
                        CharacterCard(
                            character = char,
                            selected = char.id in selectedIds,
                            onTap = { selectedIds = selectedIds.toggle(char.id) },
                            onLongPress = { onOpenWizard(CharacterRole.side, char) },
                        )
                    }
                    item { AddTile { onOpenWizard(CharacterRole.side, null) } }
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(16.dp),
                ) {
                    Button(
                        onClick = { onStartFlow(selected) },
                        enabled = selected.isNotEmpty() && inFlight == null,
                        shape = RoundedCornerShape(50),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Accent,
                            contentColor = Color.White,
                            disabledContainerColor = Accent.copy(alpha = 0.35f),
                        ),
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                    ) {
                        Text(
                            text = if (selected.isEmpty()) "Pick characters to start" else "Start (${selected.size})",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                }
            }
        }

        if (isFetching && !vm.isLoading) {
            CircularProgressIndicator(
                color = Accent,
                strokeWidth = 2.dp,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 18.dp, end = 18.dp)
                    .size(16.dp),
            )
        }
    }

    error?.let { msg ->
        AlertDialog(
            onDismissRequest = vm::clearError,
            title = { Text("Something went wrong") },
            text = { Text(msg) },
            confirmButton = { TextButton(onClick = vm::clearError) { Text("OK") } },
        )
    }

    pendingDelete?.let { char ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("Delete ${char.name}?") },
            text = { Text("This can't be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    vm.delete(char.id)
                    pendingDelete = null
                }) { Text("Delete", color = Accent) }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = null }) { Text("Cancel") }
            },
        )
    }
}

private fun Set<String>.toggle(id: String): Set<String> =
    if (id in this) this - id else this + id

@Composable
private fun LatestStoryBanner(
    story: StoryResponse,
    onTap: () -> Unit,
    onDismiss: () -> Unit,
) {
    val isReady = story.status == StoryStatus.ready
    val ageMs = runCatching {
        java.time.Instant.parse(story.updatedAt).toEpochMilli().let {
            System.currentTimeMillis() - it
        }
    }.getOrDefault(0L)
    val fresh = isReady && ageMs in 0L..(30L * 60_000L)
    val eyebrow = when {
        !isReady -> "Crafting your story"
        fresh -> "✨ Your story is ready"
        else -> "Pick up where you left off"
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(MiloCream.copy(alpha = 0.08f))
            .border(
                width = if (fresh) 2.dp else 1.dp,
                color = if (fresh) Accent else MiloCream.copy(alpha = 0.18f),
                shape = RoundedCornerShape(18.dp),
            )
            .clickable(onClick = onTap)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (!isReady) {
            CircularProgressIndicator(color = Accent, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
            Spacer(Modifier.size(12.dp))
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(eyebrow, color = MiloCream.copy(alpha = 0.7f), fontSize = 12.sp)
            Text(
                story.title ?: "Untitled story",
                color = MiloCream,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
            )
        }
        TextButton(onClick = onDismiss) {
            Text("Dismiss", color = MiloCream.copy(alpha = 0.6f), fontSize = 13.sp)
        }
    }
}

@Composable
private fun GenerationBanner(
    title: String,
    status: GenerationStatus,
    onTapReady: (String) -> Unit,
    onDismissFailed: () -> Unit,
) {
    val (eyebrow, isReady, storyId) = when (status) {
        is GenerationStatus.Generating -> Triple("Crafting your story", false, null)
        is GenerationStatus.Ready -> Triple("✨ Your story is ready", true, status.story.id)
        is GenerationStatus.Failed -> Triple("Generation hit a snag", false, null)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(MiloCream.copy(alpha = 0.08f))
            .border(
                width = if (isReady) 2.dp else 1.dp,
                color = if (isReady) Accent else MiloCream.copy(alpha = 0.18f),
                shape = RoundedCornerShape(18.dp),
            )
            .clickable(enabled = isReady && storyId != null) { storyId?.let(onTapReady) }
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (status is GenerationStatus.Generating) {
            CircularProgressIndicator(color = Accent, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
            Spacer(Modifier.size(12.dp))
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(eyebrow, color = MiloCream.copy(alpha = 0.7f), fontSize = 12.sp)
            Text(title, color = MiloCream, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        }
        if (status is GenerationStatus.Failed) {
            TextButton(onClick = onDismissFailed) {
                Text("Dismiss", color = Accent, fontSize = 13.sp)
            }
        }
    }
}

private fun LazyGridScope.sectionHeader(text: String) {
    item(span = { GridItemSpan(maxLineSpan) }) {
        Text(
            text = text,
            color = MiloCream,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(top = 8.dp, bottom = 4.dp),
        )
    }
}

@Composable
private fun HomeTopBar(onSignOut: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "Luna Stories",
            color = MiloCream,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.weight(1f),
        )
        IconButton(onClick = onSignOut) {
            Icon(Icons.Default.Menu, contentDescription = "Account", tint = MiloCream)
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun CharacterCard(
    character: CharacterResponse,
    selected: Boolean,
    onTap: () -> Unit,
    onLongPress: () -> Unit,
) {
    val tint = ColorPalette.color(character.tint)
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .combinedClickable(onClick = onTap, onLongClick = onLongPress),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(modifier = Modifier.fillMaxWidth().aspectRatio(1f)) {
            CharacterIconView(
                symbolName = character.symbolName,
                tint = tint,
                modifier = Modifier
                    .fillMaxSize()
                    .border(
                        width = if (selected) 3.dp else 0.dp,
                        color = if (selected) Accent else Color.Transparent,
                        shape = RoundedCornerShape(22.dp),
                    ),
            )
            if (selected) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(6.dp)
                        .size(22.dp)
                        .clip(CircleShape)
                        .background(Accent),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(14.dp),
                    )
                }
            }
        }
        Text(
            text = character.name,
            color = MiloCream,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(top = 6.dp),
        )
    }
}

@Composable
private fun AddTile(onTap: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(22.dp))
                .border(2.dp, Accent.copy(alpha = 0.6f), RoundedCornerShape(22.dp))
                .clickable(onClick = onTap),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Default.Add, contentDescription = "Add character", tint = Accent, modifier = Modifier.size(32.dp))
        }
        Text("Add", color = MiloCream.copy(alpha = 0.7f), fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp))
    }
}
