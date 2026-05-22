package com.cortexlumora.lunastories.ui.screens

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
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Star
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cortexlumora.lunastories.network.CreateFeedbackRequest
import com.cortexlumora.lunastories.network.FeedbackAPI
import com.cortexlumora.lunastories.network.FeedbackCategory
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream
import kotlinx.coroutines.launch

@Composable
fun FeedbackScreen(onClose: () -> Unit) {
    var category by remember { mutableStateOf(FeedbackCategory.idea) }
    var message by remember { mutableStateOf("") }
    var rating by remember { mutableStateOf<Int?>(null) }
    var submitting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var done by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    BackHandler(onBack = onClose)

    Box(modifier = Modifier.fillMaxSize()) {
        MoodyTwilightBackground()

        Column(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onClose) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MiloCream)
                }
                Text("Send Feedback", color = MiloCream, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }

            if (done) {
                SuccessBody(onClose = onClose)
                return@Column
            }

            Column(
                modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp).padding(top = 12.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                CategoryChips(
                    selected = category,
                    onSelect = { category = it },
                )

                OutlinedTextField(
                    value = message,
                    onValueChange = { if (it.length <= 2000) message = it },
                    placeholder = { Text("Tell us what's on your mind…", color = MiloCream.copy(alpha = 0.4f)) },
                    modifier = Modifier.fillMaxWidth().heightIn(min = 160.dp),
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

                RatingRow(rating = rating, onChange = { rating = it })

                Spacer(Modifier.weight(1f))

                Button(
                    onClick = {
                        submitting = true
                        error = null
                        scope.launch {
                            runCatching {
                                FeedbackAPI.create(
                                    CreateFeedbackRequest(
                                        category = category,
                                        message = message.trim(),
                                        rating = rating,
                                    ),
                                )
                            }
                                .onSuccess { done = true }
                                .onFailure { error = it.message ?: "Couldn't send feedback" }
                            submitting = false
                        }
                    },
                    enabled = !submitting && message.trim().isNotEmpty(),
                    shape = RoundedCornerShape(50),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Accent,
                        contentColor = Color.White,
                        disabledContainerColor = Accent.copy(alpha = 0.4f),
                    ),
                    modifier = Modifier.fillMaxWidth().height(52.dp).navigationBarsPadding(),
                ) {
                    Text(if (submitting) "Sending…" else "Send Feedback", fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }

    error?.let { msg ->
        AlertDialog(
            onDismissRequest = { error = null },
            title = { Text("Couldn't send feedback") },
            text = { Text(msg) },
            confirmButton = { TextButton(onClick = { error = null }) { Text("OK") } },
        )
    }
}

@Composable
private fun CategoryChips(selected: FeedbackCategory, onSelect: (FeedbackCategory) -> Unit) {
    val items: List<Triple<FeedbackCategory, String, ImageVector>> = listOf(
        Triple(FeedbackCategory.bug, "Bug", Icons.Default.BugReport),
        Triple(FeedbackCategory.idea, "Idea", Icons.Default.Lightbulb),
        Triple(FeedbackCategory.praise, "Praise", Icons.Default.Favorite),
        Triple(FeedbackCategory.other, "Other", Icons.Default.MoreHoriz),
    )
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items.forEach { (cat, label, icon) ->
            val isSel = cat == selected
            Column(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(14.dp))
                    .background(if (isSel) Accent.copy(alpha = 0.18f) else MiloCream.copy(alpha = 0.06f))
                    .border(
                        width = if (isSel) 2.dp else 1.dp,
                        color = if (isSel) Accent else MiloCream.copy(alpha = 0.12f),
                        shape = RoundedCornerShape(14.dp),
                    )
                    .clickable { onSelect(cat) }
                    .padding(vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Icon(icon, contentDescription = null, tint = if (isSel) Accent else MiloCream, modifier = Modifier.size(20.dp))
                Spacer(Modifier.height(4.dp))
                Text(label, color = MiloCream, fontSize = 12.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}

@Composable
private fun RatingRow(rating: Int?, onChange: (Int?) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        (1..5).forEach { i ->
            val filled = (rating ?: 0) >= i
            IconButton(onClick = { onChange(if (rating == i) null else i) }) {
                Icon(
                    imageVector = if (filled) Icons.Default.Star else Icons.Outlined.Star,
                    contentDescription = "$i stars",
                    tint = if (filled) Color(0xFFFFCC00) else MiloCream.copy(alpha = 0.4f),
                )
            }
        }
    }
}

@Composable
private fun SuccessBody(onClose: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(Color(0xFF34C759).copy(alpha = 0.22f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF34C759), modifier = Modifier.size(44.dp))
        }
        Spacer(Modifier.height(18.dp))
        Text("Thanks for the note!", color = MiloCream, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(8.dp))
        Text(
            "We read every message — your feedback helps make Luna Stories better.",
            color = MiloCream.copy(alpha = 0.65f),
            fontSize = 14.sp,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(28.dp))
        Button(
            onClick = onClose,
            shape = RoundedCornerShape(50),
            colors = ButtonDefaults.buttonColors(containerColor = Accent, contentColor = Color.White),
            modifier = Modifier.fillMaxWidth().height(50.dp),
        ) { Text("Done", fontWeight = FontWeight.SemiBold) }
    }
}
