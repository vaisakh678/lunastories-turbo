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
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyGridScope
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.AlertDialog
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.clerk.api.Clerk
import com.cortexlumora.lunastories.network.CharacterResponse
import com.cortexlumora.lunastories.network.CharacterRole
import com.cortexlumora.lunastories.ui.components.CharacterIconView
import com.cortexlumora.lunastories.ui.components.ColorPalette
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream
import com.cortexlumora.lunastories.viewmodels.CharactersViewModel
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    onOpenWizard: (role: CharacterRole, existing: CharacterResponse?) -> Unit,
    modifier: Modifier = Modifier,
    vm: CharactersViewModel = viewModel(),
) {
    val characters by vm.characters.collectAsState()
    val isFetching by vm.isFetching.collectAsState()
    val error by vm.error.collectAsState()
    val scope = rememberCoroutineScope()
    var pendingDelete by remember { mutableStateOf<CharacterResponse?>(null) }

    LaunchedEffect(Unit) { vm.load() }

    val main = characters.filter { it.role == CharacterRole.main }
    val side = characters.filter { it.role == CharacterRole.side }

    Box(modifier = modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            HomeTopBar(onSignOut = { scope.launch { Clerk.auth.signOut() } })

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
                ) {
                    sectionHeader("Main Characters")
                    items(main, key = { it.id }) { char ->
                        CharacterCard(
                            character = char,
                            onTap = { onOpenWizard(CharacterRole.main, char) },
                            onLongPress = { pendingDelete = char },
                        )
                    }
                    item { AddTile { onOpenWizard(CharacterRole.main, null) } }

                    sectionHeader("Side Characters")
                    items(side, key = { it.id }) { char ->
                        CharacterCard(
                            character = char,
                            onTap = { onOpenWizard(CharacterRole.side, char) },
                            onLongPress = { pendingDelete = char },
                        )
                    }
                    item { AddTile { onOpenWizard(CharacterRole.side, null) } }
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
            confirmButton = {
                TextButton(onClick = vm::clearError) { Text("OK") }
            },
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
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
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
            Icon(
                imageVector = Icons.Default.Menu,
                contentDescription = "Account",
                tint = MiloCream,
            )
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun CharacterCard(
    character: CharacterResponse,
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
        CharacterIconView(
            symbolName = character.symbolName,
            tint = tint,
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f),
        )
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
                .border(
                    width = 2.dp,
                    color = Accent.copy(alpha = 0.6f),
                    shape = RoundedCornerShape(22.dp),
                )
                .clickable(onClick = onTap),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Add character",
                tint = Accent,
                modifier = Modifier.size(32.dp),
            )
        }
        Text(
            text = "Add",
            color = MiloCream.copy(alpha = 0.7f),
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 6.dp),
        )
    }
}
