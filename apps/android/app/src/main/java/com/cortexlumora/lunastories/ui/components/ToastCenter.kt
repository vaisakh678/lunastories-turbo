package com.cortexlumora.lunastories.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.ALPHA_MUTED
import com.cortexlumora.lunastories.ui.theme.GlowCoral
import com.cortexlumora.lunastories.ui.theme.GlowGold
import com.cortexlumora.lunastories.ui.theme.MiloCream
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * App-scoped, lightweight toast notifications. Mirrors iOS ToastCenter:
 * a single in-flight toast, auto-dismissing after a delay, rendered by
 * `ToastOverlay()` placed once at the app root. Two shapes:
 *  - compact error (e.g. generation rejected / quota hit)
 *  - a larger card with a title + progress bar (e.g. "running low" at >=80%)
 */
enum class ToastStyle {
    Error,
    Warning,
    Info,
    Success;

    val icon: ImageVector
        get() = when (this) {
            Error -> Icons.Filled.Warning
            Warning -> Icons.Filled.Error
            Info -> Icons.Filled.Info
            Success -> Icons.Filled.CheckCircle
        }

    val tint: Color
        get() = when (this) {
            Error -> GlowCoral
            Warning -> GlowGold
            Info -> Accent
            Success -> Color(0xFF66C78C)
        }
}

data class Toast(
    val id: String = UUID.randomUUID().toString(),
    val title: String? = null,
    val message: String,
    val style: ToastStyle = ToastStyle.Error,
    /** Optional progress value, 0..1 — drives the "running low" card. */
    val progress: Float? = null,
)

object ToastCenter {
    private val scope = CoroutineScope(Dispatchers.Main)
    private var dismissJob: Job? = null

    private val _current = MutableStateFlow<Toast?>(null)
    val current: StateFlow<Toast?> = _current.asStateFlow()

    /** Show a toast, auto-dismissing after [durationMs]. Replaces any current one. */
    fun show(
        message: String,
        title: String? = null,
        style: ToastStyle = ToastStyle.Error,
        progress: Float? = null,
        durationMs: Long = 3_000,
    ) {
        _current.value = Toast(title = title, message = message, style = style, progress = progress)
        dismissJob?.cancel()
        dismissJob = scope.launch {
            delay(durationMs)
            _current.value = null
        }
    }

    fun dismiss() {
        dismissJob?.cancel()
        _current.value = null
    }
}

/**
 * Renders the current toast pinned to the top. Place once at the app root
 * (e.g. in the root Box). Only the card captures touches, so it never blocks
 * the UI underneath when idle.
 */
@Composable
fun ToastOverlay(modifier: Modifier = Modifier) {
    val current by ToastCenter.current.collectAsState()

    Box(modifier = modifier.fillMaxWidth().statusBarsPadding()) {
        AnimatedVisibility(
            visible = current != null,
            enter = slideInVertically { -it } + fadeIn(),
            exit = slideOutVertically { -it } + fadeOut(),
            modifier = Modifier.align(Alignment.TopCenter),
        ) {
            current?.let { ToastCard(it) { ToastCenter.dismiss() } }
        }
    }
}

@Composable
private fun ToastCard(toast: Toast, onDismiss: () -> Unit) {
    Row(
        modifier = Modifier
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFF2A2138))
            .border(1.dp, toast.style.tint.copy(alpha = 0.45f), RoundedCornerShape(16.dp))
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Icon(
            toast.style.icon,
            contentDescription = null,
            tint = toast.style.tint,
            modifier = Modifier.size(20.dp),
        )

        Column(modifier = Modifier.weight(1f)) {
            toast.title?.let { title ->
                Text(
                    title,
                    color = MiloCream,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(Modifier.height(6.dp))
            }
            Text(
                toast.message,
                color = if (toast.title == null) MiloCream else MiloCream.copy(alpha = 0.75f),
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (toast.title == null) FontWeight.Medium else FontWeight.Normal,
            )
            toast.progress?.let { p ->
                Spacer(Modifier.height(8.dp))
                ProgressBar(value = p, tint = toast.style.tint)
            }
        }

        Icon(
            Icons.Filled.Close,
            contentDescription = "Dismiss",
            tint = MiloCream.copy(alpha = ALPHA_MUTED),
            modifier = Modifier
                .size(18.dp)
                .clickable(onClick = onDismiss),
        )
    }
}

@Composable
private fun ProgressBar(value: Float, tint: Color) {
    val clamped = value.coerceIn(0f, 1f)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(6.dp)
            .clip(RoundedCornerShape(3.dp))
            .background(MiloCream.copy(alpha = 0.15f)),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(clamped)
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(tint),
        )
    }
}
