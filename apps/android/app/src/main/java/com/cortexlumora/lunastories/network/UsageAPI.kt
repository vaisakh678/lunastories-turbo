package com.cortexlumora.lunastories.network

import kotlinx.serialization.Serializable

/** Mirrors GenerationUsageDTO — weekly quota for one kind of generation. */
@Serializable
data class GenerationUsage(
    val message: String,
    val used: Int,
    val total: Int,
    val remaining: Int,
    val percentUsed: Int,
    val resetsAt: String,
)

/** Mirrors UsageSummaryDTO — both quotas at once (GET /usage). */
@Serializable
data class UsageSummary(
    val stories: GenerationUsage,
    val audio: GenerationUsage,
)

/**
 * Weekly usage quotas. Best-effort on the client — a failed fetch keeps the
 * UI quiet rather than surfacing an error, since usage display is non-critical.
 * Mirrors iOS UsageAPI.
 */
object UsageAPI {
    suspend fun fetch(): UsageSummary = APIClient.get("/usage")
}
