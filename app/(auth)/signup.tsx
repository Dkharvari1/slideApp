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

export default function SignUpScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onCreate = async () => {
        setError(null);
        if (!name.trim() || !email.trim() || !pwd.trim() || !confirm.trim()) {
            setError("Please complete all fields.");
            return;
        }
        if (!email.endsWith(".edu")) {
            setError("Use your .edu email to verify student status.");
            return;
        }
        if (pwd.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (pwd !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        // TODO: Replace with real sign-up (Firebase Auth + Firestore profile)
        setTimeout(() => {
            setLoading(false);
            router.replace("/"); // Navigate into the app once wired up
        }, 800);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#0F1216" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoRow}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="flame" size={26} color="#0F1216" />
                        </View>
                        <Text style={styles.brand}>Slide</Text>
                    </View>
                    <Text style={styles.title}>Create your account</Text>
                    <Text style={styles.subtitle}>Students get access to exclusive deals</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Full name</Text>
                        <TextInput
                            placeholder="Dev Kharvari"
                            placeholderTextColor="#8A8F98"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>College email (.edu)</Text>
                        <TextInput
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="you@uic.edu"
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
                                placeholder="Create a strong password"
                                placeholderTextColor="#8A8F98"
                                value={pwd}
                                onChangeText={setPwd}
                                style={[styles.input, { flex: 1, paddingRight: 44 }]}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPwd((s) => !s)}
                                style={styles.eyeButton}
                            >
                                <Ionicons
                                    name={showPwd ? "eye-off" : "eye"}
                                    size={20}
                                    color="#C8CDD4"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Confirm password</Text>
                        <View style={styles.passwordRow}>
                            <TextInput
                                secureTextEntry={!showConfirm}
                                placeholder="Re-enter password"
                                placeholderTextColor="#8A8F98"
                                value={confirm}
                                onChangeText={setConfirm}
                                style={[styles.input, { flex: 1, paddingRight: 44 }]}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirm((s) => !s)}
                                style={styles.eyeButton}
                            >
                                <Ionicons
                                    name={showConfirm ? "eye-off" : "eye"}
                                    size={20}
                                    color="#C8CDD4"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                        onPress={onCreate}
                        disabled={loading}
                    >
                        <Text style={styles.primaryBtnText}>
                            {loading ? "Creating account..." : "Create Account"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Switch to Login */}
                <View style={styles.bottomRow}>
                    <Text style={styles.bottomText}>Already have an account?</Text>
                    <Link href="/auth/login" asChild>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Sign in</Text>
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
        gap: 8,
    },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    brand: { color: "#E6E8EB", fontSize: 18, fontWeight: "700", letterSpacing: 0.5 },
    logoCircle: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: ACCENT,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: "#E6E8EB",
        fontSize: 24,
        fontWeight: "700",
        marginTop: 4,
    },
    subtitle: { color: "#A8B0BA", fontSize: 14 },
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
