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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cortexlumora.lunastories.LegalLinks
import com.cortexlumora.lunastories.R
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.ALPHA_CAPTION
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.GlowCoral
import com.cortexlumora.lunastories.ui.theme.GlowGold
import com.cortexlumora.lunastories.ui.theme.MiloCream
import com.cortexlumora.lunastories.viewmodels.SubscriptionsViewModel
import com.revenuecat.purchases.Package
import com.revenuecat.purchases.models.PricingPhase
import kotlinx.coroutines.delay

private data class Feature(val title: String, val detail: String)

private val Features = listOf(
    Feature("Unlimited stories", "Generate a fresh tale every single night, never the same twice."),
    Feature("10 audio narrations a week", "Soothing AI voice, ready in under a minute."),
    Feature("Every story world", "Alice, Oz, Jungle Book, Inventors, Construction, and more."),
    Feature("Lessons that stick", "Pick a moral and Luna weaves it gently into the story."),
    Feature("No ads, ever", "Just stories. Designed for bedtime, not for engagement metrics."),
)

@Composable
fun PaywallScreen(
    onDismiss: () -> Unit,
    vm: SubscriptionsViewModel = viewModel(),
) {
    BackHandler(onBack = onDismiss)
    val context = LocalContext.current
    val offerings by vm.offerings.collectAsState()
    val isLoading by vm.isLoading.collectAsState()
    val isPurchasing by vm.isPurchasing.collectAsState()
    val isRestoring by vm.isRestoring.collectAsState()
    val error by vm.error.collectAsState()
    val didSucceed by vm.didSucceed.collectAsState()

    val packages = remember(offerings) { offerings?.current?.availablePackages.orEmpty() }
    var selectedId by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(packages) {
        if (selectedId == null && packages.isNotEmpty()) {
            // Default to annual if present (matches iOS behavior).
            selectedId = packages.firstOrNull { it.identifier.contains("annual", ignoreCase = true) }?.identifier
                ?: packages.first().identifier
        }
    }
    val selected = remember(packages, selectedId) {
        packages.firstOrNull { it.identifier == selectedId }
    }

    LaunchedEffect(didSucceed) {
        if (didSucceed) {
            delay(1400)
            vm.consumeSuccess()
            onDismiss()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding(),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onDismiss, modifier = Modifier.padding(start = 12.dp)) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = MiloCream)
                }
                Spacer(Modifier.weight(1f))
            }

            // Scroll area — only the hero + features. Plans pinned with CTA below.
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Hero()
                Spacer(Modifier.height(28.dp))
                Features.forEach { FeatureRow(it) }
                Spacer(Modifier.height(12.dp))
            }

            // Sticky footer — plans + CTA + restore/links. Always visible.
            Column(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                when {
                    isLoading && packages.isEmpty() -> Box(
                        modifier = Modifier.fillMaxWidth().height(80.dp),
                        contentAlignment = Alignment.Center,
                    ) { CircularProgressIndicator(color = Accent) }
                    packages.isEmpty() -> Text(
                        "Couldn't load plans. Pull to retry.",
                        color = MiloCream.copy(alpha = ALPHA_CAPTION),
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(vertical = 16.dp),
                    )
                    else -> Column(
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        packages.forEach { pkg ->
                            PlanCard(
                                pkg = pkg,
                                isSelected = selected?.identifier == pkg.identifier,
                                onClick = { selectedId = pkg.identifier },
                            )
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))

                CtaButton(
                    label = if (selected?.hasFreeTrial() == true) "Start free trial" else "Continue",
                    isPurchasing = isPurchasing,
                    enabled = selected != null && !isPurchasing,
                    onClick = {
                        val pkg = selected ?: return@CtaButton
                        val activity = context as? android.app.Activity ?: return@CtaButton
                        vm.purchase(activity, pkg)
                    },
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = selected?.let { footerText(it) } ?: "",
                    color = MiloCream.copy(alpha = ALPHA_CAPTION),
                    style = MaterialTheme.typography.labelSmall,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    RestoreButton(isRestoring = isRestoring, onClick = vm::restore)
                    Text("·", color = MiloCream.copy(alpha = ALPHA_CAPTION))
                    LinkText("Terms") { open(context, LegalLinks.TERMS_URL) }
                    Text("·", color = MiloCream.copy(alpha = ALPHA_CAPTION))
                    LinkText("Privacy") { open(context, LegalLinks.PRIVACY_URL) }
                }
            }
        }

        if (didSucceed) {
            SuccessOverlay()
        }
    }

    error?.let { msg ->
        AlertDialog(
            onDismissRequest = vm::clearError,
            title = { Text("Couldn't complete the purchase") },
            text = { Text(msg) },
            confirmButton = { TextButton(onClick = vm::clearError) { Text("OK") } },
        )
    }
}

// ─────────────────────────────────────────────────────────────────────

@Composable
private fun Hero() {
    Box(contentAlignment = Alignment.Center) {
        Box(
            modifier = Modifier
                .size(140.dp)
                .blur(40.dp)
                .clip(CircleShape)
                .background(GlowCoral.copy(alpha = 0.32f)),
        )
        Box(
            modifier = Modifier
                .size(110.dp)
                .blur(28.dp)
                .clip(CircleShape)
                .background(GlowGold.copy(alpha = 0.30f)),
        )
        Image(
            painter = painterResource(R.drawable.splash_icon),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(96.dp)
                .shadow(18.dp, RoundedCornerShape(22.dp))
                .clip(RoundedCornerShape(22.dp))
                .border(1.dp, MiloCream.copy(alpha = 0.12f), RoundedCornerShape(22.dp)),
        )
    }
    Spacer(Modifier.height(18.dp))
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(Accent.copy(alpha = 0.16f))
            .border(1.dp, Accent.copy(alpha = 0.6f), RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text("LUNA STORIES PRO", color = Accent, style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold))
    }
    Spacer(Modifier.height(12.dp))
    Text(
        "Unlock the full Luna magic",
        color = MiloCream,
        style = MaterialTheme.typography.headlineMedium,
        textAlign = TextAlign.Center,
    )
    Spacer(Modifier.height(8.dp))
    Text(
        "Unlimited bedtime stories. Every world. Every night.",
        color = MiloCream.copy(alpha = ALPHA_MUTED),
        style = MaterialTheme.typography.bodyMedium,
        textAlign = TextAlign.Center,
    )
}

@Composable
private fun FeatureRow(feature: Feature) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(MiloCream.copy(alpha = 0.06f))
            .border(1.dp, MiloCream.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
            .padding(14.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Box(
            modifier = Modifier
                .size(26.dp)
                .clip(CircleShape)
                .background(Accent.copy(alpha = 0.20f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Default.Check, contentDescription = null, tint = Accent, modifier = Modifier.size(16.dp))
        }
        Spacer(Modifier.size(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(feature.title, color = MiloCream, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(2.dp))
            Text(feature.detail, color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun PlanCard(pkg: Package, isSelected: Boolean, onClick: () -> Unit) {
    val period = pkg.subscriptionPeriodLabel()
    val price = pkg.product.price.formatted
    val isAnnual = pkg.identifier.contains("annual", ignoreCase = true)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(MiloCream.copy(alpha = if (isSelected) 0.10f else 0.04f))
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) Accent else MiloCream.copy(alpha = 0.10f),
                shape = RoundedCornerShape(18.dp),
            )
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(22.dp)
                .clip(CircleShape)
                .background(if (isSelected) Accent else Color.Transparent)
                .border(
                    width = 2.dp,
                    color = if (isSelected) Accent else MiloCream.copy(alpha = 0.3f),
                    shape = CircleShape,
                ),
            contentAlignment = Alignment.Center,
        ) {
            if (isSelected) {
                Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
            }
        }
        Spacer(Modifier.size(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(period.title, color = MiloCream, style = MaterialTheme.typography.titleMedium)
                if (isAnnual) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(Accent)
                            .padding(horizontal = 8.dp, vertical = 2.dp),
                    ) {
                        Text("BEST VALUE", color = Color.White, style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                    }
                }
            }
            Spacer(Modifier.height(2.dp))
            Text(
                if (isAnnual) "Save vs monthly · cancel anytime" else "Cancel anytime",
                color = MiloCream.copy(alpha = ALPHA_CAPTION),
                style = MaterialTheme.typography.bodySmall,
            )
        }
        Text(price, color = MiloCream, style = MaterialTheme.typography.titleMedium)
    }
}

@Composable
private fun CtaButton(label: String, isPurchasing: Boolean, enabled: Boolean, onClick: () -> Unit) {
    val gradient = Brush.linearGradient(listOf(GlowGold, GlowCoral))
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(54.dp)
            .shadow(14.dp, RoundedCornerShape(50), spotColor = GlowCoral)
            .clip(RoundedCornerShape(50))
            .background(if (enabled) gradient else Brush.linearGradient(listOf(GlowCoral.copy(alpha = 0.4f), GlowGold.copy(alpha = 0.4f))))
            .clickable(enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        if (isPurchasing) {
            CircularProgressIndicator(color = Color.White, strokeWidth = 2.dp, modifier = Modifier.size(22.dp))
        } else {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(label, color = Color.White, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun RestoreButton(isRestoring: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier.clickable(enabled = !isRestoring, onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (isRestoring) {
            CircularProgressIndicator(color = MiloCream, strokeWidth = 2.dp, modifier = Modifier.size(12.dp))
            Spacer(Modifier.size(6.dp))
        }
        Text("Restore", color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun LinkText(text: String, onClick: () -> Unit) {
    Text(
        text,
        color = MiloCream.copy(alpha = ALPHA_MUTED),
        style = MaterialTheme.typography.bodySmall,
        modifier = Modifier.clickable(onClick = onClick),
    )
}

@Composable
private fun SuccessOverlay() {
    Box(
        modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.55f)),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier
                .clip(RoundedCornerShape(22.dp))
                .background(MiloCream.copy(alpha = 0.10f))
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("✨", style = MaterialTheme.typography.displayLarge)
            Spacer(Modifier.height(10.dp))
            Text("Welcome to Luna Pro ✨", color = MiloCream, style = MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.height(6.dp))
            Text("Tonight's stories are on us.", color = MiloCream.copy(alpha = ALPHA_MUTED), style = MaterialTheme.typography.bodyMedium)
        }
    }
}

// ─────────────────────────────────────────────────────────────────────
// Package helpers
// ─────────────────────────────────────────────────────────────────────

private data class PeriodLabel(val title: String, val unitShort: String)

private fun Package.subscriptionPeriodLabel(): PeriodLabel {
    val period = product.period
    val unit = period?.unit?.name?.lowercase()
    return when {
        unit == "year" -> PeriodLabel("Annual", "/yr")
        unit == "month" -> PeriodLabel("Monthly", "/mo")
        unit == "week" -> PeriodLabel("Weekly", "/wk")
        else -> PeriodLabel(identifier, "")
    }
}

private fun Package.hasFreeTrial(): Boolean =
    product.defaultOption?.pricingPhases?.any { phase ->
        phase.price.amountMicros == 0L && phase.recurrenceMode == phase.recurrenceMode // any free phase
    } ?: false

private fun footerText(pkg: Package): String {
    val unit = pkg.subscriptionPeriodLabel().unitShort
    val price = pkg.product.price.formatted
    val trial = pkg.product.defaultOption?.pricingPhases?.firstOrNull { (it as PricingPhase).price.amountMicros == 0L }
    return if (trial != null) {
        val days = trial.billingPeriod.iso8601.removePrefix("P").removeSuffix("D").toIntOrNull() ?: 7
        "Free for $days days, then $price$unit. Cancel anytime."
    } else {
        "Then $price$unit. Cancel anytime."
    }
}

private fun open(ctx: android.content.Context, url: String) {
    runCatching {
        ctx.startActivity(
            android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url))
                .addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK),
        )
    }
}
