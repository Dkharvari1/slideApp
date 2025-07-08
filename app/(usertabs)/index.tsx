// app/index.tsx

import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const categories = [
  { id: "1", name: "Food" },
  { id: "2", name: "Coffee" },
  { id: "3", name: "Books" },
  { id: "4", name: "Clothing" },
  { id: "5", name: "Tech" },
];

const featuredDeals = [
  {
    id: "1",
    title: "50% off Coffee",
    description: "Half-price lattes all day at Campus Cafe.",
    image: {
      uri:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=60",
    },
  },
  // ... more items
];

const nearbyDeals = [
  {
    id: "1",
    title: "Buy 1 Get 1 Bubble Tea",
    description: "BOGO on all flavors at TeaTime.",
    image: {
      uri:
        "https://images.unsplash.com/photo-1571689936848-1a9f4e6b8f64?auto=format&fit=crop&w=800&q=60",
    },
  },
  // ... more items
];

export default function HomeScreen() {
  const cardWidth = SCREEN_WIDTH * 0.7; // 70% of screen for featured

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Slide
        </Text>
      </View>
      <ScrollView>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    paddingTop: 20,
    paddingLeft: 30,
    // backgroundColor: "#FFF",
  },
  logo: {
    color: "#FD3535",
    fontSize: 25,
    fontWeight: 700
  },
});
