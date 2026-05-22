package com.cortexlumora.lunastories.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.BundledAvatars
import com.cortexlumora.lunastories.network.CharacterRelation
import com.cortexlumora.lunastories.network.CharacterResponse
import com.cortexlumora.lunastories.network.CharacterRole
import com.cortexlumora.lunastories.network.CreateCharacterRequest
import com.cortexlumora.lunastories.network.Gender
import com.cortexlumora.lunastories.network.UpdateCharacterRequest
import com.cortexlumora.lunastories.ui.components.CharacterIconView
import com.cortexlumora.lunastories.ui.components.ColorPalette
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream

private data class CharacterDraft(
    val name: String = "",
    val age: Int = 6,
    val gender: Gender = Gender.na,
    val iconName: String = BundledAvatars.ids.first(),
    val relation: CharacterRelation? = null,
    val customRelation: String = "",
    val hairColor: String? = null,
    val eyeColor: String? = null,
    val hairstyle: String? = null,
)

private fun CharacterResponse.toDraft() = CharacterDraft(
    name = name,
    age = age ?: 6,
    gender = gender ?: Gender.na,
    iconName = symbolName,
    relation = relation,
    customRelation = customRelation.orEmpty(),
    hairColor = hairColor,
    eyeColor = eyeColor,
    hairstyle = hairstyle,
)

private val HairColors = listOf(
    "Black" to Color(0xFF1C1C1E),
    "Brown" to Color(0xFFA2845E),
    "Blonde" to Color(0xFFE9C46A),
    "Red" to Color(0xFFD64C3A),
    "Gray" to Color(0xFF8E8E93),
    "White" to Color(0xFFF5F5F0),
    "Blue" to Color(0xFF3B82F6),
    "Pink" to Color(0xFFFF77A8),
)
private val EyeColors = listOf(
    "Brown" to Color(0xFFA2845E),
    "Blue" to Color(0xFF3B82F6),
    "Green" to Color(0xFF4ADE80),
    "Hazel" to Color(0xFFE6A85C),
    "Gray" to Color(0xFF8E8E93),
)
private val Hairstyles = listOf("Short", "Long", "Curly", "Straight", "Ponytail", "Braids", "Bald")

/**
 * 3-step character creation / edit. Side characters use a Basics →
 * Relationship → Icon flow; main characters use Basics → Icon →
 * Appearance. Mirrors the iOS CharacterWizardSheet.
 */
@Composable
fun CharacterWizardSheet(
    role: CharacterRole,
    existing: CharacterResponse?,
    onDismiss: () -> Unit,
    onSubmit: (CreateOrUpdate) -> Unit,
    onDelete: ((String) -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    val isEdit = existing != null
    var draft by remember { mutableStateOf(existing?.toDraft() ?: CharacterDraft()) }
    var stepIndex by remember { mutableStateOf(0) }
    var pendingDelete by remember { mutableStateOf(false) }

    val totalSteps = 3
    val isLast = stepIndex == totalSteps - 1
    val canAdvance = when (stepIndex) {
        0 -> draft.name.trim().isNotEmpty()
        else -> true
    }

    Box(modifier = modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(horizontal = 20.dp),
        ) {
            // Top bar
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = MiloCream)
                }
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    text = if (isEdit) "Edit Character" else if (role == CharacterRole.main) "New main character" else "New side character",
                    color = MiloCream,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(modifier = Modifier.weight(1f))
                if (isEdit && onDelete != null) {
                    IconButton(onClick = { pendingDelete = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MiloCream)
                    }
                } else {
                    Spacer(modifier = Modifier.size(48.dp))
                }
            }

            // Progress
            ProgressBar(current = stepIndex + 1, total = totalSteps)

            Spacer(modifier = Modifier.height(20.dp))

            // Step content
            Box(modifier = Modifier.weight(1f)) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState()),
                ) {
                    when (role) {
                        CharacterRole.main -> when (stepIndex) {
                            0 -> BasicsStepMain(draft) { draft = it }
                            1 -> IconStep(draft) { draft = it }
                            2 -> AppearanceStep(draft) { draft = it }
                        }
                        CharacterRole.side -> when (stepIndex) {
                            0 -> BasicsStepSide(draft) { draft = it }
                            1 -> RelationshipStep(draft) { draft = it }
                            2 -> IconStep(draft) { draft = it }
                        }
                    }
                }
            }

            // Bottom nav
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                if (stepIndex > 0) {
                    Button(
                        onClick = { stepIndex -= 1 },
                        modifier = Modifier.weight(1f).height(52.dp),
                        shape = RoundedCornerShape(50),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MiloCream.copy(alpha = 0.12f),
                            contentColor = MiloCream,
                        ),
                    ) { Text("Back") }
                }
                Button(
                    onClick = {
                        if (isLast) {
                            onSubmit(buildSubmit(role, existing, draft))
                            onDismiss()
                        } else {
                            stepIndex += 1
                        }
                    },
                    enabled = canAdvance,
                    modifier = Modifier.weight(1f).height(52.dp),
                    shape = RoundedCornerShape(50),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Accent,
                        contentColor = Color.White,
                        disabledContainerColor = Accent.copy(alpha = 0.4f),
                    ),
                ) { Text(if (isLast) "Save" else "Next", fontWeight = FontWeight.SemiBold) }
            }
        }
    }

    if (pendingDelete && existing != null && onDelete != null) {
        AlertDialog(
            onDismissRequest = { pendingDelete = false },
            title = { Text("Delete ${existing.name}?") },
            text = { Text("This can't be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    onDelete(existing.id)
                    pendingDelete = false
                    onDismiss()
                }) { Text("Delete", color = Accent) }
            },
            dismissButton = {
                TextButton(onClick = { pendingDelete = false }) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun ProgressBar(current: Int, total: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        repeat(total) { i ->
            val filled = i < current
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(if (filled) Accent else MiloCream.copy(alpha = 0.15f)),
            )
        }
    }
}

@Composable
private fun FieldLabel(text: String) {
    Text(
        text = text,
        color = MiloCream.copy(alpha = 0.7f),
        fontSize = 13.sp,
        fontWeight = FontWeight.Medium,
        modifier = Modifier.padding(bottom = 6.dp),
    )
}

@Composable
private fun NameField(value: String, placeholder: String, onChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        placeholder = { Text(placeholder, color = MiloCream.copy(alpha = 0.35f)) },
        singleLine = true,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = TextFieldDefaults.colors(
            focusedTextColor = MiloCream,
            unfocusedTextColor = MiloCream,
            focusedContainerColor = MiloCream.copy(alpha = 0.08f),
            unfocusedContainerColor = MiloCream.copy(alpha = 0.08f),
            focusedIndicatorColor = Accent,
            unfocusedIndicatorColor = MiloCream.copy(alpha = 0.2f),
            cursorColor = Accent,
        ),
    )
}

@Composable
private fun BasicsStepMain(draft: CharacterDraft, onChange: (CharacterDraft) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        Column {
            FieldLabel("Name")
            NameField(value = draft.name, placeholder = "e.g. Milo") { onChange(draft.copy(name = it)) }
        }
        Column {
            FieldLabel("Age")
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                IconButton(
                    onClick = { onChange(draft.copy(age = (draft.age - 1).coerceAtLeast(1))) },
                ) {
                    Icon(Icons.Default.Remove, contentDescription = "Decrement", tint = MiloCream)
                }
                Text(
                    text = "${draft.age} years",
                    color = MiloCream,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center,
                )
                IconButton(
                    onClick = { onChange(draft.copy(age = (draft.age + 1).coerceAtMost(18))) },
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Increment", tint = MiloCream)
                }
            }
        }
        Column {
            FieldLabel("Gender")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(Gender.male to "Male", Gender.female to "Female", Gender.na to "N/A").forEach { (g, label) ->
                    SegmentChip(
                        text = label,
                        selected = draft.gender == g,
                        onClick = { onChange(draft.copy(gender = g)) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}

@Composable
private fun BasicsStepSide(draft: CharacterDraft, onChange: (CharacterDraft) -> Unit) {
    Column {
        FieldLabel("Name")
        NameField(value = draft.name, placeholder = "e.g. Grandma Rose") { onChange(draft.copy(name = it)) }
    }
}

@Composable
private fun RelationshipStep(draft: CharacterDraft, onChange: (CharacterDraft) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        FieldLabel("Who is this character to your kid?")
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.height(380.dp),
        ) {
            items(CharacterRelation.values().toList()) { rel ->
                val selected = draft.relation == rel
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (selected) Accent else MiloCream.copy(alpha = 0.08f))
                        .clickable { onChange(draft.copy(relation = rel)) },
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = rel.displayName,
                        color = if (selected) Color.White else MiloCream,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
        }
        AnimatedVisibility(visible = draft.relation == CharacterRelation.other) {
            Column {
                FieldLabel("How would you describe them?")
                NameField(
                    value = draft.customRelation,
                    placeholder = "e.g. Mentor, Neighbour, Coach",
                ) { onChange(draft.copy(customRelation = it)) }
            }
        }
    }
}

@Composable
private fun IconStep(draft: CharacterDraft, onChange: (CharacterDraft) -> Unit) {
    Column {
        FieldLabel("Pick an icon")
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.height(520.dp),
        ) {
            items(BundledAvatars.ids) { avatarId ->
                val selected = draft.iconName == avatarId
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1f)
                        .clip(RoundedCornerShape(22.dp))
                        .clickable { onChange(draft.copy(iconName = avatarId)) }
                        .border(
                            width = if (selected) 3.dp else 0.dp,
                            color = if (selected) Accent else Color.Transparent,
                            shape = RoundedCornerShape(22.dp),
                        ),
                ) {
                    CharacterIconView(
                        symbolName = avatarId,
                        tint = Accent,
                        modifier = Modifier.fillMaxSize(),
                    )
                }
            }
        }
    }
}

@Composable
private fun AppearanceStep(draft: CharacterDraft, onChange: (CharacterDraft) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(22.dp)) {
        Column {
            FieldLabel("Hair color")
            ColorChipRow(
                options = HairColors,
                selected = draft.hairColor,
                onSelect = { onChange(draft.copy(hairColor = it)) },
            )
        }
        Column {
            FieldLabel("Eye color")
            ColorChipRow(
                options = EyeColors,
                selected = draft.eyeColor,
                onSelect = { onChange(draft.copy(eyeColor = it)) },
            )
        }
        Column {
            FieldLabel("Hairstyle")
            ChipFlow(
                options = Hairstyles,
                selected = draft.hairstyle?.let { setOf(it) } ?: emptySet(),
                onToggle = { onChange(draft.copy(hairstyle = if (draft.hairstyle == it) null else it)) },
            )
        }
    }
}

@Composable
private fun ColorChipRow(
    options: List<Pair<String, Color>>,
    selected: String?,
    onSelect: (String) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        options.forEach { (name, color) ->
            val isSelected = selected == name
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .weight(1f)
                    .clickable { onSelect(name) },
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(color)
                        .border(
                            width = if (isSelected) 3.dp else 1.dp,
                            color = if (isSelected) Accent else MiloCream.copy(alpha = 0.25f),
                            shape = CircleShape,
                        ),
                )
                Text(
                    text = name,
                    color = MiloCream.copy(alpha = if (isSelected) 1f else 0.7f),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
        }
    }
}

@Composable
private fun ChipFlow(
    options: List<String>,
    selected: Set<String>,
    onToggle: (String) -> Unit,
) {
    // Simple wrapping row via FlowRow alternative — Compose Foundation 1.8+ has FlowRow,
    // but we keep it lightweight: chunked rows of 3.
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        options.chunked(3).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { opt ->
                    SegmentChip(
                        text = opt,
                        selected = opt in selected,
                        onClick = { onToggle(opt) },
                        modifier = Modifier.weight(1f),
                    )
                }
                repeat(3 - row.size) { Spacer(modifier = Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
private fun SegmentChip(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .height(40.dp)
            .clip(RoundedCornerShape(50))
            .background(if (selected) Accent else MiloCream.copy(alpha = 0.08f))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            color = if (selected) Color.White else MiloCream,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
        )
    }
}

sealed class CreateOrUpdate {
    data class Create(val request: CreateCharacterRequest) : CreateOrUpdate()
    data class Update(val id: String, val request: UpdateCharacterRequest) : CreateOrUpdate()
}

private fun buildSubmit(
    role: CharacterRole,
    existing: CharacterResponse?,
    draft: CharacterDraft,
): CreateOrUpdate {
    val name = draft.name.trim()
    val tagline = when (role) {
        CharacterRole.side -> when (draft.relation) {
            CharacterRelation.other -> draft.customRelation.trim().ifEmpty { CharacterRelation.other.displayName }
            null -> null
            else -> draft.relation.displayName
        }
        CharacterRole.main -> null
    }
    val tint = existing?.tint ?: if (role == CharacterRole.main) "orange" else "gray"

    return if (existing == null) {
        CreateOrUpdate.Create(
            CreateCharacterRequest(
                role = role,
                name = name,
                symbolName = draft.iconName,
                tint = tint,
                tagline = tagline,
                relation = draft.relation.takeIf { role == CharacterRole.side },
                customRelation = draft.customRelation.trim().takeIf { role == CharacterRole.side && draft.relation == CharacterRelation.other && it.isNotEmpty() },
                age = draft.age.takeIf { role == CharacterRole.main },
                gender = draft.gender.takeIf { role == CharacterRole.main },
                hairColor = draft.hairColor,
                eyeColor = draft.eyeColor,
                hairstyle = draft.hairstyle,
            ),
        )
    } else {
        CreateOrUpdate.Update(
            id = existing.id,
            request = UpdateCharacterRequest(
                name = name,
                symbolName = draft.iconName,
                tagline = tagline,
                relation = draft.relation.takeIf { role == CharacterRole.side },
                customRelation = draft.customRelation.trim().takeIf { role == CharacterRole.side && draft.relation == CharacterRelation.other },
                age = draft.age.takeIf { role == CharacterRole.main },
                gender = draft.gender.takeIf { role == CharacterRole.main },
                hairColor = draft.hairColor,
                eyeColor = draft.eyeColor,
                hairstyle = draft.hairstyle,
            ),
        )
    }
}
