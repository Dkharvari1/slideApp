// app/(auth)/login.tsx
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onLogin = async () => {
        setError(null);
        // if (!email.trim() || !pwd.trim()) {
        //     setError("Please enter your email and password.");
        //     return;
        // }
        setLoading(true);
        // TODO: Replace with real auth (Firebase, Supabase, etc.)
        setTimeout(() => {
            setLoading(false);
            // Go directly to the (user) tab group Home screen
            router.replace("/(user)");
        }, 700);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#0F1216" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Brand / Welcome */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="flash" size={28} color="#0F1216" />
                    </View>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Sign in to continue with Slide</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="you@college.edu"
                            placeholderTextColor="#8A8F98"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordRow}>
                            <TextInput
                                secureTextEntry={!showPwd}
                                placeholder="••••••••"
                                placeholderTextColor="#8A8F98"
                                value={pwd}
                                onChangeText={setPwd}
                                style={[styles.input, { flex: 1, paddingRight: 44 }]}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPwd((s) => !s)}
                                style={styles.eyeButton}
                                accessibilityRole="button"
                                accessibilityLabel={showPwd ? "Hide password" : "Show password"}
                            >
                                <Ionicons
                                    name={showPwd ? "eye-off" : "eye"}
                                    size={20}
                                    color="#C8CDD4"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                        onPress={onLogin}
                        disabled={loading}
                    >
                        <Text style={styles.primaryBtnText}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.textBtn}>
                        <Text style={styles.textBtnText}>Forgot password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Switch to Sign Up */}
                <View style={styles.bottomRow}>
                    <Text style={styles.bottomText}>New here?</Text>
                    <Link href="/signup" asChild>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Create an account</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const ACCENT = "#FD2525";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 100,
        gap: 20,
    },
    header: {
        marginTop: 8,
        alignItems: "center",
        gap: 10,
    },
    logoCircle: {
        height: 56,
        width: 56,
        borderRadius: 28,
        backgroundColor: ACCENT,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: ACCENT,
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
    },
    title: {
        color: "#E6E8EB",
        fontSize: 26,
        fontWeight: "700",
    },
    subtitle: {
        color: "#A8B0BA",
        fontSize: 14,
    },
    card: {
        backgroundColor: "#151A20",
        borderRadius: 18,
        padding: 18,
        gap: 14,
        borderWidth: 1,
        borderColor: "#1F2630",
    },
    field: { gap: 8 },
    label: { color: "#C8CDD4", fontSize: 13 },
    input: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 14,
        backgroundColor: "#0F141A",
        borderWidth: 1,
        borderColor: "#222A35",
        color: "#E6E8EB",
    },
    passwordRow: { position: "relative", flexDirection: "row", alignItems: "center" },
    eyeButton: {
        position: "absolute",
        right: 12,
        height: 44,
        width: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtn: {
        marginTop: 6,
        height: 52,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ACCENT,
    },
    primaryBtnText: { color: "#0F1216", fontWeight: "700", fontSize: 16 },
    textBtn: { alignSelf: "center", paddingVertical: 6 },
    textBtnText: { color: "#A8B0BA" },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
        marginTop: "auto",
        marginBottom: 20,
    },
    bottomText: { color: "#8A8F98" },
    linkText: { color: "#E6E8EB", fontWeight: "600" },
    error: { color: "#ff6b6b", fontSize: 12, marginTop: 2 },
});
