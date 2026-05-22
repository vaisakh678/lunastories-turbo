package com.cortexlumora.lunastories.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
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
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clerk.api.Clerk
import com.cortexlumora.lunastories.BuildConfig
import com.cortexlumora.lunastories.network.UserAPI
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream
import kotlinx.coroutines.launch

private const val TERMS_URL = "https://lunastories.app/terms"
private const val PRIVACY_URL = "https://lunastories.app/privacy"

@Composable
fun SettingsScreen(onBack: () -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var confirmingDelete by remember { mutableStateOf(false) }
    var deleting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    BackHandler(enabled = !deleting, onBack = onBack)

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MiloCream)
                }
                Text("Settings", color = MiloCream, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Section("About") {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { open(ctx, TERMS_URL) }
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("Terms of Service", color = MiloCream, fontSize = 15.sp, modifier = Modifier.weight(1f))
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MiloCream.copy(alpha = 0.4f))
                    }
                    SoftDivider()
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { open(ctx, PRIVACY_URL) }
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("Privacy Policy", color = MiloCream, fontSize = 15.sp, modifier = Modifier.weight(1f))
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MiloCream.copy(alpha = 0.4f))
                    }
                    SoftDivider()
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("Version", color = MiloCream, fontSize = 15.sp, modifier = Modifier.weight(1f))
                        Text(
                            "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})",
                            color = MiloCream.copy(alpha = 0.55f),
                            fontSize = 14.sp,
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))

                Section("Danger Zone") {
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
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.weight(1f),
                        )
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MiloCream.copy(alpha = 0.4f))
                    }
                }
                Text(
                    "This permanently deletes your account, characters, and stories. This cannot be undone.",
                    color = MiloCream.copy(alpha = 0.55f),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(horizontal = 4.dp),
                )

                Spacer(Modifier.height(24.dp))
            }
        }

        if (deleting) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.55f)),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Accent)
                    Spacer(Modifier.height(16.dp))
                    Text("Deleting account…", color = MiloCream, fontSize = 14.sp)
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

    error?.let { msg ->
        AlertDialog(
            onDismissRequest = { error = null },
            title = { Text("Couldn't delete account") },
            text = { Text(msg) },
            confirmButton = { TextButton(onClick = { error = null }) { Text("OK") } },
        )
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Column {
        Text(
            title,
            color = MiloCream.copy(alpha = 0.7f),
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
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
private fun SoftDivider() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 16.dp)
            .height(1.dp)
            .background(MiloCream.copy(alpha = 0.08f)),
    )
}

private fun open(ctx: android.content.Context, url: String) {
    runCatching {
        ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        })
    }
}
