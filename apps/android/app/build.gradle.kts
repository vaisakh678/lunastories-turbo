import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

// Release signing — credentials live in app/keystore.properties (gitignored)
// so the keystore file path + passwords + alias never enter source control.
// See app/keystore.properties.example for the expected keys.
val keystoreProps = Properties().apply {
    val f = rootProject.file("app/keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

android {
    namespace = "com.cortexlumora.lunastories"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.cortexlumora.lunastories"
        minSdk = 24
        targetSdk = 36
        versionCode = 3
        versionName = "1.0.2"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    // One flavor per environment, mirroring the iOS Config/*.xcconfig split
    // (Local/Dev/Prod). Each flavor supplies the env-specific build config; the
    // app name is set via resValue so installs sit side by side on a device.
    // PostHog key + host are the same everywhere — the key is a public,
    // write-only project token; only POSTHOG_ENABLED varies (prod only).
    flavorDimensions += "environment"
    productFlavors {
        create("local") {
            dimension = "environment"
            resValue("string", "app_name", "Luna (Local)")
            // 10.0.2.2 is the emulator's loopback for the host machine.
            // The api server listens on 3001 (apps/api/src/index.ts) — 3000 is
            // taken by apps/docs in dev, hitting it returns HTML and the Ktor
            // client errors out with the Next.js page body as the message.
            buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3001\"")
            buildConfigField(
                "String",
                "CLERK_PUBLISHABLE_KEY",
                "\"pk_test_YXJ0aXN0aWMtYm9hLTc4LmNsZXJrLmFjY291bnRzLmRldiQ\"",
            )
            buildConfigField("String", "REVENUECAT_API_KEY", "\"goog_ysmCipdCRiqpPxyJgsxMdBpTDdm\"")
            buildConfigField("boolean", "POSTHOG_ENABLED", "false")
            buildConfigField("String", "POSTHOG_API_KEY", "\"phc_uELVgfpSKGRYPo5MYFNbPTXbFLb86RuKMgKqaBZaCarC\"")
            buildConfigField("String", "POSTHOG_HOST", "\"https://us.i.posthog.com\"")
        }
        create("dev") {
            dimension = "environment"
            resValue("string", "app_name", "Luna (Dev)")
            buildConfigField("String", "API_BASE_URL", "\"https://dev-api-development-13c7.up.railway.app\"")
            buildConfigField(
                "String",
                "CLERK_PUBLISHABLE_KEY",
                "\"pk_test_YXJ0aXN0aWMtYm9hLTc4LmNsZXJrLmFjY291bnRzLmRldiQ\"",
            )
            buildConfigField("String", "REVENUECAT_API_KEY", "\"goog_ysmCipdCRiqpPxyJgsxMdBpTDdm\"")
            buildConfigField("boolean", "POSTHOG_ENABLED", "false")
            buildConfigField("String", "POSTHOG_API_KEY", "\"phc_uELVgfpSKGRYPo5MYFNbPTXbFLb86RuKMgKqaBZaCarC\"")
            buildConfigField("String", "POSTHOG_HOST", "\"https://us.i.posthog.com\"")
        }
        create("prod") {
            dimension = "environment"
            resValue("string", "app_name", "Luna")
            buildConfigField("String", "API_BASE_URL", "\"https://lunastories-prod-api.cortexlumora.com\"")
            buildConfigField(
                "String",
                "CLERK_PUBLISHABLE_KEY",
                "\"pk_live_Y2xlcmsubHVuYXN0b3JpZXMuY29ydGV4bHVtb3JhLmNvbSQ\"",
            )
            buildConfigField("String", "REVENUECAT_API_KEY", "\"goog_ysmCipdCRiqpPxyJgsxMdBpTDdm\"")
            buildConfigField("boolean", "POSTHOG_ENABLED", "true")
            buildConfigField("String", "POSTHOG_API_KEY", "\"phc_uELVgfpSKGRYPo5MYFNbPTXbFLb86RuKMgKqaBZaCarC\"")
            buildConfigField("String", "POSTHOG_HOST", "\"https://us.i.posthog.com\"")
        }
    }

    signingConfigs {
        create("release") {
            val storePath = keystoreProps.getProperty("storeFile")
            if (storePath != null) {
                storeFile = file(storePath)
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Env-specific config (API URL, Clerk key, PostHog) now lives in the
            // per-environment product flavors above, not here.
            // Only attach the release signing config when keystore.properties
            // is present, so ./gradlew assembleRelease still compiles locally
            // even before the keystore is set up.
            if (keystoreProps.getProperty("storeFile") != null) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.JVM_11
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.clerk.android.api)
    implementation(libs.ktor.client.android)
    implementation(libs.ktor.client.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.media3.exoplayer)
    // Play Billing — adds the com.android.vending.BILLING permission via
    // manifest merger, which is what unlocks the Subscriptions menu in
    // Play Console once the AAB is uploaded. RevenueCat (or direct
    // billing) wires up against this lib later.
    implementation(libs.android.billing.ktx)
    implementation(libs.revenuecat)
    implementation(libs.posthog.android)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
