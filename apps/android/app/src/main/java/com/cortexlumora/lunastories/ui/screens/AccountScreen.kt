package com.cortexlumora.lunastories.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clerk.api.Clerk
import com.cortexlumora.lunastories.R
import com.cortexlumora.lunastories.subscriptions.Subscriptions
import com.cortexlumora.lunastories.ui.findActivity
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.GlowCoral
import com.cortexlumora.lunastories.ui.theme.GlowGold
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_FAINT
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.MiloCream
import kotlinx.coroutines.launch

@Composable
fun AccountScreen(
    onBack: () -> Unit,
    onOpenMyStories: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenFeedback: () -> Unit,
    onOpenPaywall: () -> Unit,
    isPro: Boolean = false,
) {
    val user by Clerk.userFlow.collectAsStateWithLifecycle(initialValue = null)
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var confirmingLogout by remember { mutableStateOf(false) }
    var isLoggingOut by remember { mutableStateOf(false) }

    val greeting = user?.firstName?.takeIf { it.isNotEmpty() }
        ?.let { "Hello, $it" } ?: "Hello, Storyteller"

    BackHandler(onBack = onBack)

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .verticalScroll(rememberScrollState()),
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MiloCream)
                }
                Spacer(Modifier.weight(1f))
                // Only nudge an upgrade when they're not already subscribed.
                if (!isPro) {
                    TextButton(onClick = onOpenPaywall) {
                        Text(
                            "PRO",
                            color = Accent,
                            fontWeight = FontWeight.Black,
                            fontSize = 13.sp,
                            letterSpacing = 0.8.sp,
                        )
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            Hero(greeting = greeting)
            Spacer(Modifier.height(24.dp))

            SubscriptionBanner(
                isPro = isPro,
                onUpgrade = onOpenPaywall,
                onManage = {
                    context.findActivity()?.let { Subscriptions.manage(it) }
                },
            )
            Spacer(Modifier.height(24.dp))

            // Menu card
            Column(
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MiloCream.copy(alpha = 0.06f))
                    .border(1.dp, MiloCream.copy(alpha = 0.08f), RoundedCornerShape(16.dp)),
            ) {
                MenuRow(icon = Icons.AutoMirrored.Filled.MenuBook, title = "My Stories", onTap = onOpenMyStories)
                SoftDivider()
                MenuRow(icon = Icons.Default.Settings, title = "Settings", onTap = onOpenSettings)
                SoftDivider()
                MenuRow(icon = Icons.AutoMirrored.Filled.Chat, title = "Send Feedback", onTap = onOpenFeedback)
            }

            Spacer(Modifier.height(16.dp))

            // Logout card
            Column(
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MiloCream.copy(alpha = 0.06f))
                    .border(1.dp, MiloCream.copy(alpha = 0.08f), RoundedCornerShape(16.dp)),
            ) {
                MenuRow(
                    icon = Icons.AutoMirrored.Filled.Logout,
                    title = "Logout",
                    tint = Color(0xFFFF453A),
                    isLoading = isLoggingOut,
                    onTap = { confirmingLogout = true },
                )
            }

            Spacer(Modifier.height(40.dp))
        }
    }

    if (confirmingLogout) {
        AlertDialog(
            onDismissRequest = { confirmingLogout = false },
            title = { Text("Are you sure you want to logout?") },
            confirmButton = {
                TextButton(onClick = {
                    confirmingLogout = false
                    isLoggingOut = true
                    scope.launch {
                        Clerk.auth.signOut()
                        isLoggingOut = false
                    }
                }) { Text("Logout", color = Color(0xFFFF453A)) }
            },
            dismissButton = {
                TextButton(onClick = { confirmingLogout = false }) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun Hero(greeting: String) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(contentAlignment = Alignment.Center) {
            // Coral glow. A radial gradient (not Modifier.blur) so the halo is a
            // smooth circle on every API level — blur is a no-op below API 31 and
            // its default rectangular edge treatment clipped the glow into a hard
            // square.
            Box(
                modifier = Modifier
                    .size(150.dp)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(GlowCoral.copy(alpha = 0.40f), Color.Transparent),
                        ),
                        shape = CircleShape,
                    ),
            )
            // Gold glow
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(GlowGold.copy(alpha = 0.32f), Color.Transparent),
                        ),
                        shape = CircleShape,
                    ),
            )
            // Splash icon
            Image(
                painter = painterResource(R.drawable.splash_icon),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(96.dp)
                    .clip(RoundedCornerShape(22.dp))
                    .border(1.dp, MiloCream.copy(alpha = 0.12f), RoundedCornerShape(22.dp)),
            )
        }
        Spacer(Modifier.height(14.dp))
        Text(greeting, color = MiloCream, style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(4.dp))
        Text("Manage your profile", color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.titleSmall)
    }
}

@Composable
private fun SubscriptionBanner(
    isPro: Boolean,
    onUpgrade: () -> Unit,
    onManage: () -> Unit,
) {
    Row(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MiloCream.copy(alpha = 0.06f))
            .border(
                1.dp,
                if (isPro) Accent.copy(alpha = 0.35f) else MiloCream.copy(alpha = 0.08f),
                RoundedCornerShape(16.dp),
            )
            .clickable(onClick = if (isPro) onManage else onUpgrade)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Accent.copy(alpha = 0.18f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                if (isPro) Icons.Filled.WorkspacePremium else Icons.Filled.AutoAwesome,
                contentDescription = null,
                tint = Accent,
                modifier = Modifier.size(18.dp),
            )
        }
        Spacer(Modifier.size(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                if (isPro) "Luna Pro" else "Unlock Luna Pro",
                color = MiloCream,
                style = MaterialTheme.typography.titleMedium,
            )
            Spacer(Modifier.height(3.dp))
            Text(
                if (isPro) "Your subscription is active" else "Unlimited stories & narration",
                color = MiloCream.copy(alpha = ALPHA_CAPTION),
                style = MaterialTheme.typography.bodySmall,
            )
        }
        Spacer(Modifier.size(8.dp))
        Text(
            if (isPro) "Manage" else "Upgrade",
            color = if (isPro) MiloCream.copy(alpha = 0.9f) else Accent,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun MenuRow(
    icon: ImageVector,
    title: String,
    onTap: () -> Unit,
    tint: Color = Accent,
    isLoading: Boolean = false,
) {
    val titleColor = if (tint == Accent) MiloCream else tint
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onTap)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(RoundedCornerShape(9.dp))
                .background(tint.copy(alpha = 0.18f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(16.dp))
        }
        Spacer(Modifier.size(14.dp))
        Text(title, color = titleColor, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        if (isLoading) {
            CircularProgressIndicator(color = tint, strokeWidth = 2.dp, modifier = Modifier.size(14.dp))
        } else {
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MiloCream.copy(alpha = ALPHA_FAINT),
                modifier = Modifier.size(18.dp),
            )
        }
    }
}

@Composable
private fun SoftDivider() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 62.dp)
            .height(1.dp)
            .background(MiloCream.copy(alpha = 0.08f)),
    )
}
