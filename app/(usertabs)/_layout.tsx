import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: "coral" }}>
        <Tabs.Screen name="index" options={{ title: "Home", headerShown: false, tabBarIcon: ({color, focused}) => {
          return focused ? (
              <Ionicons name="home-sharp" size={24} color={color} />
            ) : (
              <Ionicons name="home-outline" size={24} color="black" />
            )
          
         } }} />
        <Tabs.Screen name="explore" options={{
          title: "Explore", tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <Ionicons name="search" size={24} color={color} />
            ) : (
              <Ionicons name="search-outline" size={24} color="black" />
            )

          }
        }} />
      </Tabs>
  
  );
}
