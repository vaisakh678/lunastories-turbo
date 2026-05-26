package com.cortexlumora.lunastories.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.clerk.api.Clerk
import com.cortexlumora.lunastories.BuildConfig
import com.cortexlumora.lunastories.LegalLinks
import com.cortexlumora.lunastories.network.UserAPI
import com.cortexlumora.lunastories.subscriptions.Subscriptions
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_FAINT
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream
import kotlinx.coroutines.launch

// ─────────────────────────────────────────────────────────────────────
// Preference enums — mirror iOS SettingsView enums verbatim.
// ─────────────────────────────────────────────────────────────────────

private enum class SleepTimer(val label: String, val key: String) {
    None("Off", "none"),
    TenMin("10 min", "ten_min"),
    TwentyMin("20 min", "twenty_min"),
    ThirtyMin("30 min", "thirty_min"),
}

private enum class NarratorVoice(val label: String, val key: String) {
    Shimmer("Shimmer · soft", "shimmer"),
    Coral("Coral · bright", "coral"),
    Fable("Fable · storyteller", "fable"),
    Sage("Sage · calm", "sage"),
}

private enum class NarrationSpeed(val label: String, val key: String) {
    Slower("Slower", "slower"),
    Normal("Normal", "normal"),
}

private const val PREFS = "luna_settings_prefs"
private const val KEY_SLEEP_TIMER = "sleep_timer"
private const val KEY_NARRATOR_VOICE = "narrator_voice"
private const val KEY_NARRATION_SPEED = "narration_speed"
private const val KEY_BEDTIME_REMINDER = "bedtime_reminder_enabled"
private const val KEY_REMINDER_HOUR = "bedtime_reminder_hour"
private const val KEY_REMINDER_MINUTE = "bedtime_reminder_minute"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBack: () -> Unit) {
    val ctx = LocalContext.current
    val activity = ctx as? android.app.Activity
    val scope = rememberCoroutineScope()
    val prefs = remember { ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE) }

    var sleepTimer by remember {
        mutableStateOf(SleepTimer.values().firstOrNull { it.key == prefs.getString(KEY_SLEEP_TIMER, null) } ?: SleepTimer.None)
    }
    var voice by remember {
        mutableStateOf(NarratorVoice.values().firstOrNull { it.key == prefs.getString(KEY_NARRATOR_VOICE, null) } ?: NarratorVoice.Shimmer)
    }
    var speed by remember {
        mutableStateOf(NarrationSpeed.values().firstOrNull { it.key == prefs.getString(KEY_NARRATION_SPEED, null) } ?: NarrationSpeed.Normal)
    }
    var bedtimeEnabled by remember { mutableStateOf(prefs.getBoolean(KEY_BEDTIME_REMINDER, false)) }
    var reminderHour by remember { mutableStateOf(prefs.getInt(KEY_REMINDER_HOUR, 20)) }
    var reminderMinute by remember { mutableStateOf(prefs.getInt(KEY_REMINDER_MINUTE, 0)) }
    var showTimePicker by remember { mutableStateOf(false) }

    var confirmingDelete by remember { mutableStateOf(false) }
    var deleting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    BackHandler(enabled = !deleting, onBack = onBack)

    fun save(block: android.content.SharedPreferences.Editor.() -> Unit) {
        prefs.edit().apply(block).apply()
    }

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MiloCream)
                }
                Text("Settings", color = MiloCream, style = MaterialTheme.typography.headlineSmall)
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                // ── Audio & Playback ──────────────────────────────────────
                Section("Audio & Playback") {
                    PickerRow(
                        icon = Icons.Default.Bedtime,
                        title = "Sleep timer",
                        currentLabel = sleepTimer.label,
                        options = SleepTimer.values().map { it.label },
                    ) { idx ->
                        val v = SleepTimer.values()[idx]
                        sleepTimer = v
                        save { putString(KEY_SLEEP_TIMER, v.key) }
                    }
                    SoftDivider()
                    PickerRow(
                        icon = Icons.AutoMirrored.Filled.VolumeUp,
                        title = "Narrator voice",
                        currentLabel = voice.label,
                        options = NarratorVoice.values().map { it.label },
                    ) { idx ->
                        val v = NarratorVoice.values()[idx]
                        voice = v
                        save { putString(KEY_NARRATOR_VOICE, v.key) }
                    }
                    SoftDivider()
                    PickerRow(
                        icon = Icons.Default.Speed,
                        title = "Narration speed",
                        currentLabel = speed.label,
                        options = NarrationSpeed.values().map { it.label },
                    ) { idx ->
                        val v = NarrationSpeed.values()[idx]
                        speed = v
                        save { putString(KEY_NARRATION_SPEED, v.key) }
                    }
                }

                // ── Notifications ─────────────────────────────────────────
                Section("Notifications") {
                    ToggleRow(
                        icon = Icons.Default.Notifications,
                        title = "Daily bedtime reminder",
                        checked = bedtimeEnabled,
                        onCheckedChange = {
                            bedtimeEnabled = it
                            save { putBoolean(KEY_BEDTIME_REMINDER, it) }
                        },
                    )
                    AnimatedVisibility(visible = bedtimeEnabled) {
                        Column {
                            SoftDivider()
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { showTimePicker = true }
                                    .padding(horizontal = 16.dp, vertical = 14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                IconChip(Icons.Default.GraphicEq)
                                Spacer(Modifier.size(14.dp))
                                Text("Remind me at", color = MiloCream, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                                Text(
                                    formatTime(reminderHour, reminderMinute),
                                    color = MiloCream.copy(alpha = ALPHA_CAPTION),
                                    style = MaterialTheme.typography.titleSmall,
                                )
                                Spacer(Modifier.size(8.dp))
                                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_FAINT))
                            }
                        }
                    }
                }
                FooterText("We'll send a gentle nudge so you never miss story time.")

                // ── Subscription ──────────────────────────────────────────
                Section("Subscription") {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { activity?.let { Subscriptions.manage(it) } }
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        IconChip(Icons.Default.CreditCard)
                        Spacer(Modifier.size(14.dp))
                        Text("Manage Subscription", color = MiloCream, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_FAINT))
                    }
                }
                FooterText("Opens the Play Store to cancel, change plan, or restore your subscription.")

                // ── About ────────────────────────────────────────────────
                Section("About") {
                    LinkRow(icon = Icons.Default.Description, title = "Terms of Service") {
                        open(ctx, LegalLinks.TERMS_URL)
                    }
                    SoftDivider()
                    LinkRow(icon = Icons.Default.Shield, title = "Privacy Policy") {
                        open(ctx, LegalLinks.PRIVACY_URL)
                    }
                    SoftDivider()
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        IconChip(Icons.Default.Info)
                        Spacer(Modifier.size(14.dp))
                        Text("Version", color = MiloCream, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                        Text(
                            "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})",
                            color = MiloCream.copy(alpha = ALPHA_CAPTION),
                            style = MaterialTheme.typography.titleSmall,
                        )
                    }
                }

                // ── Danger Zone ──────────────────────────────────────────
                Section("Danger zone") {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = !deleting) { confirmingDelete = true }
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            "Delete Account",
                            color = Color(0xFFFF453A),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.weight(1f),
                        )
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_FAINT))
                    }
                }
                FooterText("This permanently deletes your account, characters, and stories. This cannot be undone.")

                Spacer(Modifier.height(24.dp))
            }
        }

        if (deleting) {
            Box(
                modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = ALPHA_CAPTION)),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Accent)
                    Spacer(Modifier.height(16.dp))
                    Text("Deleting account…", color = MiloCream, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }

    if (confirmingDelete) {
        AlertDialog(
            onDismissRequest = { confirmingDelete = false },
            title = { Text("Delete account?") },
            text = { Text("Your account, characters, and stories will be removed permanently.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmingDelete = false
                    deleting = true
                    scope.launch {
                        runCatching { UserAPI.deleteMe() }
                            .onSuccess { Clerk.auth.signOut() }
                            .onFailure {
                                error = it.message ?: "Couldn't delete account"
                                deleting = false
                            }
                    }
                }) { Text("Delete", color = Color(0xFFFF453A)) }
            },
            dismissButton = {
                TextButton(onClick = { confirmingDelete = false }) { Text("Cancel") }
            },
        )
    }

    if (showTimePicker) {
        val state = rememberTimePickerState(initialHour = reminderHour, initialMinute = reminderMinute)
        Dialog(onDismissRequest = { showTimePicker = false }) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(28.dp))
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(20.dp),
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Remind me at", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(16.dp))
                    TimePicker(state = state)
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TextButton(onClick = { showTimePicker = false }) { Text("Cancel") }
                        TextButton(onClick = {
                            reminderHour = state.hour
                            reminderMinute = state.minute
                            save {
                                putInt(KEY_REMINDER_HOUR, state.hour)
                                putInt(KEY_REMINDER_MINUTE, state.minute)
                            }
                            showTimePicker = false
                        }) { Text("Save", color = Accent) }
                    }
                }
            }
        }
    }

    error?.let { msg ->
        AlertDialog(
            onDismissRequest = { error = null },
            title = { Text("Couldn't delete account") },
            text = { Text(msg) },
            confirmButton = { TextButton(onClick = { error = null }) { Text("OK") } },
        )
    }
}

// ─────────────────────────────────────────────────────────────────────
// Reusable rows
// ─────────────────────────────────────────────────────────────────────

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Column {
        Text(
            title,
            color = MiloCream.copy(alpha = ALPHA_MUTED),
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
            modifier = Modifier.padding(start = 4.dp, bottom = 6.dp),
        )
        Column(
            modifier = Modifier
                .clip(RoundedCornerShape(16.dp))
                .background(MiloCream.copy(alpha = 0.06f))
                .border(1.dp, MiloCream.copy(alpha = 0.08f), RoundedCornerShape(16.dp)),
        ) { content() }
    }
}

@Composable
private fun FooterText(text: String) {
    Text(
        text,
        color = MiloCream.copy(alpha = ALPHA_CAPTION),
        style = MaterialTheme.typography.labelSmall,
        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
    )
}

@Composable
private fun SoftDivider() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 16.dp)
            .height(1.dp)
            .background(MiloCream.copy(alpha = 0.08f)),
    )
}

@Composable
private fun IconChip(icon: ImageVector) {
    Box(
        modifier = Modifier
            .size(32.dp)
            .clip(RoundedCornerShape(9.dp))
            .background(Accent.copy(alpha = 0.18f)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = Accent, modifier = Modifier.size(16.dp))
    }
}

@Composable
private fun LinkRow(icon: ImageVector, title: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconChip(icon)
        Spacer(Modifier.size(14.dp))
        Text(title, color = MiloCream, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_FAINT))
    }
}

@Composable
private fun ToggleRow(icon: ImageVector, title: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconChip(icon)
        Spacer(Modifier.size(14.dp))
        Text(title, color = MiloCream, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = Accent,
                uncheckedThumbColor = MiloCream.copy(alpha = 0.8f),
                uncheckedTrackColor = MiloCream.copy(alpha = 0.12f),
            ),
        )
    }
}

@Composable
private fun PickerRow(
    icon: ImageVector,
    title: String,
    currentLabel: String,
    options: List<String>,
    onSelect: (Int) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { expanded = true }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconChip(icon)
        Spacer(Modifier.size(14.dp))
        Text(title, color = MiloCream, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
        Text(currentLabel, color = MiloCream.copy(alpha = ALPHA_CAPTION), style = MaterialTheme.typography.titleSmall)
        Spacer(Modifier.size(8.dp))
        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MiloCream.copy(alpha = ALPHA_FAINT))

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
        ) {
            options.forEachIndexed { i, label ->
                DropdownMenuItem(
                    text = { Text(label) },
                    onClick = {
                        onSelect(i)
                        expanded = false
                    },
                )
            }
        }
    }
}

private fun formatTime(hour: Int, minute: Int): String {
    val h = if (hour == 0) 12 else if (hour > 12) hour - 12 else hour
    val am = hour < 12
    return "%d:%02d %s".format(h, minute, if (am) "AM" else "PM")
}

private fun open(ctx: Context, url: String) {
    runCatching {
        ctx.startActivity(
            Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
        )
    }
}
