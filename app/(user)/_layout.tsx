// app/(user)/_layout.tsx
// Expo Router Tabs layout for the user area (Home, Explore, Deals, Favorites, Profile)
// Docs: https://expo.github.io/router/docs (Tabs) | https://reactnavigation.org/docs/bottom-tab-navigator
// Icons: @expo/vector-icons/Ionicons

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

const ACCENT = "#FD2525";
const TAB_BG = "#151A20";
const TAB_BORDER = "#1F2630";
const INACTIVE = "#A8B0BA";
const ACTIVE = ACCENT;

export default function UserTabsLayout() {
    return (
        <Tabs
            initialRouteName="home" // app/(user)/index.tsx → Home
            screenOptions={{
                headerShown: false, // We'll design our own headers per screen if needed
                tabBarActiveTintColor: ACTIVE,
                tabBarInactiveTintColor: INACTIVE,
                tabBarStyle: {
                    backgroundColor: TAB_BG,
                    borderTopColor: TAB_BORDER,
                    borderTopWidth: Platform.OS === "ios" ? 0.5 : 1,
                    height: Platform.OS === "ios" ? 84 : 64,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === "ios" ? 24 : 12,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explore",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "compass" : "compass-outline"} size={size} color={color} />
                    ),
                }}
            />

            {/* <Tabs.Screen
                name="deals"
                options={{
                    title: "Deals",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "ticket" : "ticket-outline"} size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favorites",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "person-circle" : "person-circle-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            /> */}
        </Tabs>
    );
}
