// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*  ⚠️  DO NOT rename these two files or their route names change */}
      <Stack.Screen name="index" />      {/* login */}
      <Stack.Screen name="register" />   {/* register */}
    </Stack>
  );
}
