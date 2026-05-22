package com.cortexlumora.lunastories.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clerk.api.Clerk
import com.cortexlumora.lunastories.network.UserAPI
import com.cortexlumora.lunastories.network.UserResponse
import com.cortexlumora.lunastories.ui.components.MoodyTwilightBackground
import com.cortexlumora.lunastories.ui.theme.Accent
import com.cortexlumora.lunastories.ui.theme.MiloCream
import kotlinx.coroutines.launch

/**
 * Phase 2 home placeholder — proves the auth + Ktor + Clerk-token chain
 * works end-to-end by hitting GET /api/v1/users/me and rendering the
 * server-side identity. Replaced with the real home in phase 3.
 */
@Composable
fun HomeScreen(modifier: Modifier = Modifier) {
    var user by remember { mutableStateOf<UserResponse?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        runCatching { UserAPI.me() }
            .onSuccess { user = it }
            .onFailure { error = it.message ?: "Failed to load profile" }
        loading = false
    }

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        MoodyTwilightBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            when {
                loading -> {
                    CircularProgressIndicator(color = Accent)
                }
                user != null -> {
                    Text(
                        text = "Signed in as",
                        color = MiloCream.copy(alpha = 0.7f),
                        fontSize = 15.sp,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = user!!.name ?: user!!.email ?: user!!.id,
                        color = MiloCream,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                    )
                    user!!.email?.takeIf { it != user!!.name }?.let {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = it, color = MiloCream.copy(alpha = 0.55f), fontSize = 14.sp)
                    }
                }
                else -> {
                    Text(
                        text = error ?: "Unknown error",
                        color = MiloCream,
                        fontSize = 16.sp,
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            OutlinedButton(
                onClick = {
                    scope.launch { Clerk.auth.signOut() }
                },
                shape = RoundedCornerShape(50),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = MiloCream),
                modifier = Modifier.fillMaxWidth().height(48.dp),
            ) {
                Text(text = "Sign out", fontSize = 15.sp)
            }
        }
    }
}
