// app/(user)/index.tsx
// User Home page with dummy data, interactive like/save, and a modal to post reviews.
// Uses Expo Router tabs layout in app/(user)/_layout.tsx
// Icons: @expo/vector-icons/Ionicons

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Review = {
    id: string;
    author: string;
    rating: number; // 1..5
    text: string;
    createdAt: number;
};

type Place = {
    id: string;
    name: string;
    category: "Food" | "Coffee" | "Nightlife" | "Fitness" | "Other";
    city: string;
    distanceKm: number;
    emoji: string; // quick visual instead of image
    liked: boolean;
    saved: boolean;
    likeCount: number;
    reviews: Review[];
};

const ACCENT = "#FD2525";
const BG = "#0F1216";
const CARD = "#151A20";
const MUTED = "#A8B0BA";
const TEXT = "#E6E8EB";
const BORDER = "#1F2630";
const INPUT_BG = "#0F141A";

const DUMMY_PLACES: Place[] = [
    {
        id: "p1",
        name: "Flame & Fork",
        category: "Food",
        city: "Chicago, IL",
        distanceKm: 1.2,
        emoji: "🍔",
        liked: false,
        saved: false,
        likeCount: 42,
        reviews: [
            {
                id: "r1",
                author: "Maya",
                rating: 5,
                text: "Insane smash burgers and quick service.",
                createdAt: Date.now() - 1000 * 60 * 60 * 6,
            },
            {
                id: "r2",
                author: "Leo",
                rating: 4,
                text: "Fries could be crispier but flavors pop.",
                createdAt: Date.now() - 1000 * 60 * 60 * 22,
            },
        ],
    },
    {
        id: "p2",
        name: "Bean Theory",
        category: "Coffee",
        city: "Chicago, IL",
        distanceKm: 0.7,
        emoji: "☕️",
        liked: true,
        saved: true,
        likeCount: 128,
        reviews: [
            {
                id: "r3",
                author: "Ava",
                rating: 5,
                text: "Oat latte is elite. Study vibes are perfect.",
                createdAt: Date.now() - 1000 * 60 * 60 * 3,
            },
            {
                id: "r4",
                author: "Jay",
                rating: 4,
                text: "Good pastries, Wi-Fi holds up for Zoom.",
                createdAt: Date.now() - 1000 * 60 * 60 * 30,
            },
        ],
    },
    {
        id: "p3",
        name: "Neon Lounge",
        category: "Nightlife",
        city: "Chicago, IL",
        distanceKm: 2.9,
        emoji: "🎶",
        liked: false,
        saved: false,
        likeCount: 63,
        reviews: [
            {
                id: "r5",
                author: "Ria",
                rating: 4,
                text: "Great DJ. Gets crowded after 11.",
                createdAt: Date.now() - 1000 * 60 * 60 * 50,
            },
        ],
    },
    {
        id: "p4",
        name: "Flex Lab",
        category: "Fitness",
        city: "Chicago, IL",
        distanceKm: 1.8,
        emoji: "🏋️",
        liked: false,
        saved: true,
        likeCount: 24,
        reviews: [
            {
                id: "r6",
                author: "Noah",
                rating: 5,
                text: "Clean equipment and student discount.",
                createdAt: Date.now() - 1000 * 60 * 60 * 8,
            },
        ],
    },
];

const CATEGORIES: Array<Place["category"] | "All"> = [
    "All",
    "Food",
    "Coffee",
    "Nightlife",
    "Fitness",
];

export default function UserHome() {
    const [places, setPlaces] = useState<Place[]>(DUMMY_PLACES);
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");

    // Review modal state
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewPlaceId, setReviewPlaceId] = useState<string | null>(null);
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewText, setReviewText] = useState("");

    const filtered = useMemo(() => {
        return places.filter((p) => {
            const matchesCat = activeCategory === "All" ? true : p.category === activeCategory;
            const matchesQuery =
                !query.trim() ||
                p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
                p.category.toLowerCase().includes(query.trim().toLowerCase());
            return matchesCat && matchesQuery;
        });
    }, [places, query, activeCategory]);

    const openReview = (placeId: string) => {
        setReviewPlaceId(placeId);
        setReviewRating(5);
        setReviewText("");
        setReviewOpen(true);
    };

    const submitReview = () => {
        if (!reviewPlaceId) return;
        if (!reviewText.trim()) return;

        setPlaces((prev) =>
            prev.map((p) => {
                if (p.id !== reviewPlaceId) return p;
                const newReview: Review = {
                    id: `r-${Date.now()}`,
                    author: "You",
                    rating: reviewRating,
                    text: reviewText.trim(),
                    createdAt: Date.now(),
                };
                return { ...p, reviews: [newReview, ...p.reviews] };
            })
        );
        setReviewOpen(false);
    };

    const toggleLike = (placeId: string) => {
        setPlaces((prev) =>
            prev.map((p) =>
                p.id === placeId
                    ? {
                        ...p,
                        liked: !p.liked,
                        likeCount: p.likeCount + (p.liked ? -1 : 1),
                    }
                    : p
            )
        );
    };

    const toggleSave = (placeId: string) => {
        setPlaces((prev) => prev.map((p) => (p.id === placeId ? { ...p, saved: !p.saved } : p)));
    };

    const renderItem = ({ item }: { item: Place }) => {
        const avg = averageRating(item.reviews);
        return (
            <View style={styles.card}>
                {/* "Image" strip with emoji */}
                <View style={styles.mediaRow}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.badge}>{item.category}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.metaText}>{item.city}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.metaText}>{item.distanceKm.toFixed(1)} km</Text>
                        </View>
                    </View>

                    <View style={styles.actionsCol}>
                        <TouchableOpacity
                            onPress={() => toggleLike(item.id)}
                            accessibilityRole="button"
                            accessibilityLabel={item.liked ? "Unlike" : "Like"}
                            style={styles.iconBtn}
                        >
                            <Ionicons
                                name={item.liked ? "heart" : "heart-outline"}
                                size={22}
                                color={item.liked ? ACCENT : TEXT}
                            />
                        </TouchableOpacity>
                        <Text style={styles.countText}>{item.likeCount}</Text>

                        <TouchableOpacity
                            onPress={() => toggleSave(item.id)}
                            accessibilityRole="button"
                            accessibilityLabel={item.saved ? "Unsave" : "Save"}
                            style={[styles.iconBtn, { marginTop: 6 }]}
                        >
                            <Ionicons
                                name={item.saved ? "bookmark" : "bookmark-outline"}
                                size={22}
                                color={item.saved ? ACCENT : TEXT}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rating */}
                <View style={styles.ratingRow}>
                    <Stars rating={avg} />
                    <Text style={styles.ratingLabel}>
                        {avg.toFixed(1)} · {item.reviews.length} review{item.reviews.length !== 1 ? "s" : ""}
                    </Text>
                </View>

                {/* Reviews preview */}
                {item.reviews.slice(0, 2).map((r) => (
                    <View key={r.id} style={styles.reviewRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{r.author.slice(0, 1).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewAuthor}>{r.author}</Text>
                                <Stars rating={r.rating} size={13} />
                            </View>
                            <Text style={styles.reviewText} numberOfLines={3}>
                                {r.text}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Actions */}
                <View style={styles.ctaRow}>
                    <TouchableOpacity style={styles.ghostBtn}>
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color={TEXT} />
                        <Text style={styles.ghostBtnText}>See all reviews</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.primaryBtn} onPress={() => openReview(item.id)}>
                        <Ionicons name="create-outline" size={16} color="#0F1216" />
                        <Text style={styles.primaryBtnText}>Write a review</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: BG }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <Text style={styles.heading}>Discover</Text>
                    <TouchableOpacity accessibilityRole="button" style={styles.iconBtn}>
                        <Ionicons name="notifications-outline" size={22} color={TEXT} />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={MUTED} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search places, coffee, gyms..."
                        placeholderTextColor={MUTED}
                        style={styles.searchInput}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
                            <Ionicons name="close-circle" size={18} color={MUTED} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    {CATEGORIES.map((c) => {
                        const active = activeCategory === c;
                        return (
                            <TouchableOpacity
                                key={c}
                                style={[styles.chip, active && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                                onPress={() => setActiveCategory(c)}
                            >
                                <Text style={[styles.chipText, active && { color: "#0F1216", fontWeight: "700" }]}>
                                    {c}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* List */}
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Review Modal */}
            <Modal
                visible={reviewOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setReviewOpen(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Write a review</Text>
                            <Pressable onPress={() => setReviewOpen(false)}>
                                <Ionicons name="close" size={22} color={TEXT} />
                            </Pressable>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.label}>Your rating</Text>
                            <View style={styles.starsPicker}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <TouchableOpacity key={n} onPress={() => setReviewRating(n)} style={styles.starBtn}>
                                        <Ionicons
                                            name={reviewRating >= n ? "star" : "star-outline"}
                                            size={26}
                                            color={reviewRating >= n ? ACCENT : TEXT}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { marginTop: 14 }]}>Your review</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Share what you liked, tips for others, anything to improve..."
                                placeholderTextColor={MUTED}
                                multiline
                                value={reviewText}
                                onChangeText={setReviewText}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setReviewOpen(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.submitBtn,
                                    (!reviewText.trim() || reviewRating < 1) && { opacity: 0.6 },
                                ]}
                                onPress={submitReview}
                                disabled={!reviewText.trim() || reviewRating < 1}
                            >
                                <Text style={styles.submitText}>Post review</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

/** ---------- Helpers & small UI components ---------- */

function averageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            {Array.from({ length: full }).map((_, i) => (
                <Ionicons key={`f${i}`} name="star" size={size} color={ACCENT} />
            ))}
            {half === 1 && <Ionicons name="star-half" size={size} color={ACCENT} />}
            {Array.from({ length: empty }).map((_, i) => (
                <Ionicons key={`e${i}`} name="star-outline" size={size} color={ACCENT} />
            ))}
        </View>
    );
}

/** ---------- Styles ---------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? 16 : 8,
        backgroundColor: BG,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        justifyContent: "space-between",
        marginBottom: 8,
    },
    heading: {
        color: TEXT,
        fontSize: 26,
        fontWeight: "700",
    },
    searchBar: {
        height: 44,
        borderRadius: 12,
        backgroundColor: INPUT_BG,
        borderWidth: 1,
        borderColor: BORDER,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
    searchInput: {
        flex: 1,
        color: TEXT,
        fontSize: 14,
        paddingVertical: 8,
    },
    clearBtn: { padding: 4 },
    chipsRow: { gap: 8, paddingVertical: 12, paddingRight: 8 },
    chip: {
        height: 34,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: "center",
        justifyContent: "center",
    },
    chipText: { color: TEXT, fontSize: 13 },
    card: {
        backgroundColor: CARD,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        padding: 14,
        marginBottom: 12,
    },
    mediaRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    emoji: {
        fontSize: 28,
        backgroundColor: "#0E1319",
        borderRadius: 12,
        width: 48,
        height: 48,
        textAlign: "center",
        textAlignVertical: "center",
        includeFontPadding: false,
        paddingTop: Platform.OS === "android" ? 10 : 8,
    },
    cardTitle: {
        color: TEXT,
        fontSize: 18,
        fontWeight: "700",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
        flexWrap: "wrap",
    },
    badge: {
        color: "#D5D9E0",
        backgroundColor: "#0E1319",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        fontSize: 12,
    },
    dot: { color: "#5B6673" },
    metaText: { color: MUTED, fontSize: 12 },
    actionsCol: { alignItems: "center" },
    iconBtn: {
        height: 36,
        width: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0E1319",
        borderWidth: 1,
        borderColor: BORDER,
    },
    countText: { color: MUTED, fontSize: 12, marginTop: 4 },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
    },
    ratingLabel: { color: MUTED, fontSize: 12 },
    reviewRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#0E1319",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: BORDER,
    },
    avatarText: { color: TEXT, fontSize: 12, fontWeight: "700" },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    reviewAuthor: { color: TEXT, fontSize: 13, fontWeight: "700" },
    reviewText: { color: "#C8CDD4", marginTop: 4, fontSize: 13, lineHeight: 18 },
    ctaRow: {
        marginTop: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    ghostBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: "#0E1319",
        flex: 1,
    },
    ghostBtnText: { color: TEXT, fontWeight: "600" },
    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: ACCENT,
    },
    primaryBtnText: { color: "#0F1216", fontWeight: "800" },

    // Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    modalCard: {
        width: "100%",
        backgroundColor: CARD,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 16,
        borderTopWidth: 1,
        borderColor: BORDER,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    modalTitle: { color: TEXT, fontSize: 18, fontWeight: "700" },
    modalBody: { marginTop: 6 },
    starsPicker: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    starBtn: { padding: 2 },
    textArea: {
        marginTop: 8,
        minHeight: 110,
        maxHeight: 180,
        borderRadius: 12,
        padding: 12,
        backgroundColor: INPUT_BG,
        borderWidth: 1,
        borderColor: BORDER,
        color: TEXT,
        textAlignVertical: "top",
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 14,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "#0E1319",
        borderWidth: 1,
        borderColor: BORDER,
    },
    cancelText: { color: TEXT, fontWeight: "600" },
    submitBtn: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: ACCENT,
    },
    submitText: { color: "#0F1216", fontWeight: "800" },
    label: { color: "#C8CDD4", fontSize: 13 },
});
