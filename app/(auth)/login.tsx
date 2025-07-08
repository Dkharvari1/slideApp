import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { router, Stack } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  /** TEMP: fake auth – just check both fields filled */
  const handleLogin = () => {
    if (!email || !pw) return Alert.alert("Missing info", "Enter email & password");
    router.replace("/(usertabs)");   // jump to your existing tab navigator
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Log in" }} />

      <TextInput
        placeholder="school email"
        autoCapitalize="none"
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="password"
        secureTextEntry
        onChangeText={setPw}
        style={styles.input}
      />
      <Button title="Log in" onPress={handleLogin} />

      <View style={{ height: 16 }} />
      <Button
        title="Create a new account"
        onPress={() => router.push("/(auth)/register")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 12, borderRadius: 8 },
});
