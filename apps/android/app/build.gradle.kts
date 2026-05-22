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
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

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
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
