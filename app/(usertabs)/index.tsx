// app/index.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "2",
    title: "Free Fries",
    description: "Grab free fries with any sandwich at SubHub.",
    image:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "3",
    title: "30% off Textbooks",
    description: "Save big on rentals at BookBarn this semester.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=60",
  },
];

const nearbyDeals = [
  {
    id: "1",
    title: "Buy 1 Get 1 Bubble Tea",
    description: "BOGO on all flavors at TeaTime.",
    image:
      "https://images.unsplash.com/photo-1571689936848-1a9f4e6b8f64?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "2",
    title: "20% off Pizza",
    description: "Slice night specials at Pizza Palace.",
    image:
      "https://images.unsplash.com/photo-1601924582975-3c8f83b3a37b?auto=format&fit=crop&w=800&q=60",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hey there!</Text>
          <Text style={styles.headerSubtitle}>Find your next deal</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search deals, stores..."
            placeholderTextColor="#999"
          />
          <Ionicons name="options-outline" size={20} color="#999" />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryButton}
            >
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Deals */}
      <View style={styles.featuredContainer}>
        <Text style={styles.sectionTitle}>Featured Deals</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {featuredDeals.map((deal) => (
            <View key={deal.id} style={styles.featuredCard}>
              <Image
                source={{ uri: deal.image }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{deal.title}</Text>
                <Text style={styles.cardDescription}>
                  {deal.description}
                </Text>
                <TouchableOpacity style={styles.dealButton}>
                  <Text style={styles.dealButtonText}>View Deal</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Nearby Deals */}
      <ScrollView style={styles.nearbyContainer}>
        <Text style={styles.sectionTitle}>Nearby Deals</Text>
        {nearbyDeals.map((deal) => (
          <View key={deal.id} style={styles.dealCard}>
            <Image
              source={{ uri: deal.image }}
              style={styles.dealImage}
              resizeMode="cover"
            />
            <View style={styles.dealCardContent}>
              <Text style={styles.cardTitle}>{deal.title}</Text>
              <Text style={styles.cardDescription}>
                {deal.description}
              </Text>
              <TouchableOpacity style={styles.dealButton}>
                <Text style={styles.dealButtonText}>View Deal</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827", // gray-900
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#9CA3AF", // gray-400
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937", // gray-800
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  categoriesContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: "#1F2937", // gray-800
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 12,
  },
  categoryText: {
    color: "#D1D5DB", // gray-300
  },
  featuredContainer: {
    marginTop: 24,
  },
  featuredScroll: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  featuredCard: {
    width: 256,
    backgroundColor: "#1F2937", // gray-800
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
  },
  featuredImage: {
    width: "100%",
    height: 144,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cardDescription: {
    color: "#D1D5DB", // gray-300
    fontSize: 14,
    marginTop: 4,
  },
  dealButton: {
    marginTop: 12,
    backgroundColor: "#FD2525",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  dealButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  nearbyContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  dealCard: {
    marginBottom: 24,
    backgroundColor: "#1F2937", // gray-800
    borderRadius: 24,
    overflow: "hidden",
  },
  dealImage: {
    width: "100%",
    height: 160,
  },
  dealCardContent: {
    padding: 16,
  },
  bottomSpacer: {
    height: 80,
  },
});
