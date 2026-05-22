package com.cortexlumora.lunastories.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.network.CharacterResponse
import com.cortexlumora.lunastories.stories.CreativeOptions
import com.cortexlumora.lunastories.stories.GenerationCue
import com.cortexlumora.lunastories.stories.IconicModes
import com.cortexlumora.lunastories.stories.PickOption
import com.cortexlumora.lunastories.stories.StoryInputPayload
import com.cortexlumora.lunastories.stories.StoryMode
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.components.OptionGrid
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_FAINT
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.MiloCream
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * Entry point — picks Creative vs Iconic flow based on the mode and
 * dispatches `onGenerate` with the assembled StoryInputPayload + cues
 * once the form is complete.
 */
@Composable
fun ModeFormScreen(
    mode: StoryMode,
    characters: List<CharacterResponse>,
    onDismiss: () -> Unit,
    onGenerate: (StoryInputPayload, String, List<GenerationCue>) -> Unit,
) {
    when (mode.modeKey) {
        "creative" -> CreativeFlow(mode, characters, onDismiss, onGenerate)
        else -> IconicFlow(mode, characters, onDismiss, onGenerate)
    }
}

// ─────────────────────────────────────────────────────────────────────
// Creative mode — multi-step per character + moral
// ─────────────────────────────────────────────────────────────────────

@Composable
private fun CreativeFlow(
    mode: StoryMode,
    characters: List<CharacterResponse>,
    onDismiss: () -> Unit,
    onGenerate: (StoryInputPayload, String, List<GenerationCue>) -> Unit,
) {
    var typeByChar by remember { mutableStateOf<Map<String, PickOption>>(emptyMap()) }
    var profByChar by remember { mutableStateOf<Map<String, PickOption>>(emptyMap()) }
    var moral by remember { mutableStateOf<PickOption?>(null) }
    var step by remember { mutableStateOf(0) }
    var customMoral by remember { mutableStateOf("") }
    var showCustomMoralSheet by remember { mutableStateOf(false) }

    // Step layout: for N characters, 2N steps for type+profession, then 1 step for moral.
    val n = characters.size.coerceAtLeast(1)
    val totalSteps = n * 2 + 1
    val isLast = step == totalSteps - 1

    val canAdvance = when {
        step < n -> typeByChar.containsKey(characters[step].id)
        step < n * 2 -> profByChar.containsKey(characters[step - n].id)
        else -> moral != null
    }

    BackHandler { if (step > 0) step -= 1 else onDismiss() }

    Scaffold(
        title = mode.title,
        step = step,
        totalSteps = totalSteps,
        canAdvance = canAdvance,
        isLast = isLast,
        onBack = { if (step > 0) step -= 1 else onDismiss() },
        onClose = onDismiss,
        onNext = {
            if (!isLast) step += 1
            else {
                val payload = buildCreativePayload(characters, typeByChar, profByChar, moral!!)
                val cues = buildCreativeCues(mode, characters, typeByChar, profByChar, moral!!)
                val title = listOfNotNull(typeByChar.values.firstOrNull()?.title, moral?.title)
                    .joinToString(" · ").ifEmpty { mode.title }
                onGenerate(payload, title, cues)
            }
        },
        nextLabel = if (isLast) "Generate" else "Next",
    ) {
        when {
            step < n -> {
                val char = characters[step]
                StepHeader("What is ${char.name}?")
                OptionGrid(
                    options = CreativeOptions.types,
                    selected = typeByChar[char.id],
                    onSelect = { typeByChar = typeByChar + (char.id to it) },
                )
            }
            step < n * 2 -> {
                val char = characters[step - n]
                StepHeader("${char.name}'s profession")
                OptionGrid(
                    options = CreativeOptions.professions,
                    selected = profByChar[char.id],
                    onSelect = { profByChar = profByChar + (char.id to it) },
                )
            }
            else -> {
                StepHeader("Choose a moral")
                OptionGrid(
                    options = CreativeOptions.morals,
                    selected = moral,
                    onSelect = { moral = it },
                    columns = 2,
                    extraTile = {
                        CustomTile("Write your own") { showCustomMoralSheet = true }
                    },
                )
            }
        }
    }

    if (showCustomMoralSheet) {
        CustomTextDialog(
            title = "Your moral",
            placeholder = "e.g. Be kind even when no one is watching",
            initial = customMoral,
            onDismiss = { showCustomMoralSheet = false },
            onSave = {
                customMoral = it
                moral = PickOption(it, tintName = "purple")
                showCustomMoralSheet = false
            },
        )
    }
}

private fun buildCreativePayload(
    characters: List<CharacterResponse>,
    typeByChar: Map<String, PickOption>,
    profByChar: Map<String, PickOption>,
    moral: PickOption,
): StoryInputPayload {
    val input = buildJsonObject {
        put("typeByChar", JsonObject(typeByChar.mapValues { (_, v) -> JsonPrimitive(v.title) }))
        put("professionByChar", JsonObject(profByChar.mapValues { (_, v) -> JsonPrimitive(v.title) }))
        put("moral", moral.title)
    }
    return StoryInputPayload("creative", characters.map { it.id }, input)
}

private fun buildCreativeCues(
    mode: StoryMode,
    characters: List<CharacterResponse>,
    typeByChar: Map<String, PickOption>,
    profByChar: Map<String, PickOption>,
    moral: PickOption,
): List<GenerationCue> = buildList {
    add(GenerationCue("mode", mode.title, mode.heroRes, mode.tintName))
    characters.forEach { c ->
        typeByChar[c.id]?.let { add(GenerationCue("type-${c.id}", "${c.name} the ${it.title}", it.drawableRes, it.tintName ?: "orange")) }
        profByChar[c.id]?.let { add(GenerationCue("prof-${c.id}", "${c.name} the ${it.title}", it.drawableRes, it.tintName ?: "blue")) }
    }
    add(GenerationCue("moral", moral.title, moral.drawableRes, moral.tintName ?: "purple"))
}

// ─────────────────────────────────────────────────────────────────────
// Iconic modes — pick character + pick place
// ─────────────────────────────────────────────────────────────────────

@Composable
private fun IconicFlow(
    mode: StoryMode,
    characters: List<CharacterResponse>,
    onDismiss: () -> Unit,
    onGenerate: (StoryInputPayload, String, List<GenerationCue>) -> Unit,
) {
    val data = IconicModes.byModeKey[mode.modeKey] ?: return
    var picked by remember { mutableStateOf<PickOption?>(null) }
    var place by remember { mutableStateOf<PickOption?>(null) }
    var step by remember { mutableStateOf(0) }
    var showCustomPlaceSheet by remember { mutableStateOf(false) }

    val totalSteps = 2
    val isLast = step == totalSteps - 1
    val canAdvance = when (step) {
        0 -> picked != null
        else -> place != null
    }

    BackHandler { if (step > 0) step -= 1 else onDismiss() }

    Scaffold(
        title = mode.title,
        step = step,
        totalSteps = totalSteps,
        canAdvance = canAdvance,
        isLast = isLast,
        onBack = { if (step > 0) step -= 1 else onDismiss() },
        onClose = onDismiss,
        onNext = {
            if (!isLast) step += 1
            else {
                val payload = StoryInputPayload(
                    modeKey = mode.modeKey,
                    characterIds = characters.map { it.id },
                    input = buildJsonObject {
                        put("picked", picked!!.title)
                        put("place", place!!.title)
                    },
                )
                val cues = listOf(
                    GenerationCue("mode", mode.title, mode.heroRes, mode.tintName),
                    GenerationCue("picked", picked!!.title, picked!!.drawableRes, picked!!.tintName ?: mode.tintName),
                    GenerationCue("place", place!!.title, place!!.drawableRes, place!!.tintName ?: mode.tintName),
                )
                val title = "${picked!!.title} at ${place!!.title}"
                onGenerate(payload, title, cues)
            }
        },
        nextLabel = if (isLast) "Generate" else "Next",
    ) {
        when (step) {
            0 -> {
                StepHeader("Pick a character")
                OptionGrid(
                    options = data.characters,
                    selected = picked,
                    onSelect = { picked = it },
                )
            }
            else -> {
                StepHeader("Pick a place")
                OptionGrid(
                    options = data.places,
                    selected = place,
                    onSelect = { place = it },
                    extraTile = { CustomTile("Other") { showCustomPlaceSheet = true } },
                )
            }
        }
    }

    if (showCustomPlaceSheet) {
        CustomTextDialog(
            title = "Where does the story happen?",
            placeholder = "e.g. A floating island",
            initial = place?.title.takeIf { it !in data.places.map { p -> p.title } }.orEmpty(),
            onDismiss = { showCustomPlaceSheet = false },
            onSave = {
                place = PickOption(it, tintName = mode.tintName)
                showCustomPlaceSheet = false
            },
        )
    }
}

// ─────────────────────────────────────────────────────────────────────
// Shared scaffold + helpers
// ─────────────────────────────────────────────────────────────────────

@Composable
private fun Scaffold(
    title: String,
    step: Int,
    totalSteps: Int,
    canAdvance: Boolean,
    isLast: Boolean,
    onBack: () -> Unit,
    onClose: () -> Unit,
    onNext: () -> Unit,
    nextLabel: String,
    content: @Composable () -> Unit,
) {
    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding().padding(horizontal = 16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = if (step == 0) Icons.Default.Close else Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = null,
                        tint = MiloCream,
                    )
                }
                Spacer(Modifier.weight(1f))
                Text(title, color = MiloCream, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.weight(1f))
                IconButton(onClick = onClose) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = MiloCream.copy(alpha = ALPHA_MUTED))
                }
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                repeat(totalSteps) { i ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(if (i <= step) Accent else MiloCream.copy(alpha = 0.15f)),
                    )
                }
            }
            Spacer(Modifier.height(20.dp))
            Box(modifier = Modifier.weight(1f)) { content() }
            Button(
                onClick = onNext,
                enabled = canAdvance,
                shape = RoundedCornerShape(50),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Accent,
                    contentColor = Color.White,
                    disabledContainerColor = Accent.copy(alpha = ALPHA_FAINT),
                ),
                modifier = Modifier.fillMaxWidth().height(52.dp).padding(vertical = 4.dp),
            ) {
                Text(nextLabel, fontWeight = FontWeight.SemiBold)
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun StepHeader(text: String) {
    Text(
        text = text,
        color = MiloCream,
        style = MaterialTheme.typography.headlineSmall,
        modifier = Modifier.padding(bottom = 12.dp),
    )
}

@Composable
private fun CustomTile(label: String, onTap: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onTap),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(18.dp))
                .background(MiloCream.copy(alpha = 0.08f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Default.Edit, contentDescription = label, tint = MiloCream)
        }
        Text(label, color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 4.dp))
    }
}

@Composable
private fun CustomTextDialog(
    title: String,
    placeholder: String,
    initial: String,
    onDismiss: () -> Unit,
    onSave: (String) -> Unit,
) {
    var text by remember { mutableStateOf(initial) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                placeholder = { Text(placeholder) },
                singleLine = true,
                colors = TextFieldDefaults.colors(
                    focusedIndicatorColor = Accent,
                    cursorColor = Accent,
                ),
            )
        },
        confirmButton = {
            TextButton(
                onClick = { onSave(text.trim()) },
                enabled = text.trim().isNotEmpty(),
            ) { Text("Save", color = Accent) }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}
