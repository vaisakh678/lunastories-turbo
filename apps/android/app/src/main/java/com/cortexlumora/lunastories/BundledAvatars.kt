package com.cortexlumora.lunastories

import android.content.Context

/**
 * Mirrors `apps/ios/Luna Stories/BundledAvatars.swift` — same 21 UUIDs in
 * the same order. Each ID maps to a bundled drawable
 * `avatar_<uuid_with_underscores>.webp` under res/drawable-nodpi.
 */
object BundledAvatars {
    val ids: List<String> = listOf(
        "095ad436-8ab2-4ac9-be7a-29023a53caad",
        "0bbf5f92-1508-4acf-9e86-04ec514ea89d",
        "14f140b3-c060-43f7-832c-29f5911df06a",
        "14f54b8b-361d-421d-80bb-2426a8050802",
        "19e0ae1c-c729-4908-9b06-400731e03e09",
        "30209cc6-332f-4f5d-b1ae-00187624a7fc",
        "358c1986-7011-4996-8281-8b69ca19d4eb",
        "49dd0861-174d-4238-8191-8a361baea242",
        "599703be-e224-460f-bc0b-5c4823c0b15a",
        "61f012c9-81fc-4ece-884d-6170607cbd83",
        "62d19538-45ba-4f95-8f0a-9061c585db4e",
        "853564a9-f551-439d-9251-3105ddb370fe",
        "8f705056-5458-4ef9-9bf0-1c90156b0208",
        "98fadca3-1955-4d88-9fac-476070660c2b",
        "a1008c9e-4044-4006-9864-c01934abfa2e",
        "a141c9f5-304f-4f64-a638-ad4150cc4673",
        "c9fcb976-b370-441b-a2ed-bb46b7c5d3d8",
        "cdf2a552-aa51-4685-880e-a4e14b98b09d",
        "d0e005a7-cc3e-44bc-be88-1a67a9f3f094",
        "d1dafc21-484d-4597-a216-ff20ac1bf22e",
        "d6a49df0-a441-4536-bf5d-f4865ec0e4e4",
    )

    fun drawableResId(context: Context, uuid: String): Int {
        val name = "avatar_" + uuid.replace("-", "_")
        return context.resources.getIdentifier(name, "drawable", context.packageName)
    }
}
