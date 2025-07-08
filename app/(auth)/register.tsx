import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { router, Stack } from "expo-router";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  /** TEMP: fake register – always succeeds */
  const handleRegister = () => {
    if (!email || !pw) return Alert.alert("Missing info", "Enter email & password");
    Alert.alert("Account created", "You can now log in.");
    router.back();             // return to login screen
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Register" }} />

      <TextInput
        placeholder="school email"
        autoCapitalize="none"
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="password (min 8)"
        secureTextEntry
        onChangeText={setPw}
        style={styles.input}
      />
      <Button title="Create account" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 12, borderRadius: 8 },
});
