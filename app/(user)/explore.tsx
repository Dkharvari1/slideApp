// app/(tabs)/explore.tsx
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * Explore page
 * - Search businesses
 * - Filter by categories, price, open now
 * - Sort by Nearby / Top Rated / Popular
 * - Grid of business cards with image, rating, name, tags, distance
 * - Tap card to navigate to /establishment/[id]
 */

// ---------- Types ----------
type Biz = {
    id: string;
    name: string;
    image: string;
    rating: number; // 0..5
    reviews: number;
    price: 1 | 2 | 3; // $..$$$
    categories: string[];
    tags: string[];
    distanceMi: number; // mocked distance
    openNow: boolean;
    hasStudentDeal?: boolean;
};

// ---------- Mock data ----------
const ALL_BIZ: Biz[] = [
    {
        id: "jamjar-cafe",
        name: "JamJar Café",
        image:
            "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1600&auto=format&fit=crop",
        rating: 4.6,
        reviews: 421,
        price: 2,
        categories: ["Coffee", "Bakery"],
        tags: ["Cardamom Bun", "Cold Brew", "Study Friendly"],
        distanceMi: 0.3,
        openNow: true,
        hasStudentDeal: true,
    },
    {
        id: "tikka-town",
        name: "Tikka Town",
        image:
            "https://images.unsplash.com/photo-1604908554024-0c2a2b58c8b6?q=80&w=1600&auto=format&fit=crop",
        rating: 4.2,
        reviews: 318,
        price: 2,
        categories: ["Indian", "Casual"],
        tags: ["Butter Chicken", "Garlic Naan"],
        distanceMi: 0.9,
        openNow: true,
        hasStudentDeal: true,
    },
    {
        id: "green-leaf",
        name: "Green Leaf",
        image:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop",
        rating: 4.8,
        reviews: 510,
        price: 2,
        categories: ["Healthy", "Cafe"],
        tags: ["Matcha", "Pesto Panini", "Quiet"],
        distanceMi: 1.4,
        openNow: false,
    },
    {
        id: "pressed-co",
        name: "Pressed & Co.",
        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
        rating: 4.3,
        reviews: 189,
        price: 3,
        categories: ["Juice", "Dessert"],
        tags: ["Acai Bowl", "Cocoa Nibs"],
        distanceMi: 0.6,
        openNow: true,
    },
    {
        id: "campus-bites",
        name: "Campus Bites",
        image:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop",
        rating: 3.9,
        reviews: 260,
        price: 1,
        categories: ["Fast Casual", "Burgers"],
        tags: ["Value", "Late Night"],
        distanceMi: 0.5,
        openNow: true,
        hasStudentDeal: true,
    },
    {
        id: "mochi-melt",
        name: "Mochi Melt",
        image:
            "https://images.unsplash.com/photo-1583663848850-46af132dc08e?q=80&w=1600&auto=format&fit=crop",
        rating: 4.7,
        reviews: 144,
        price: 2,
        categories: ["Dessert"],
        tags: ["Mochi Donuts", "Gluten Friendly"],
        distanceMi: 2.0,
        openNow: false,
    },
];

// ---------- Explore Screen ----------
export default function Explore() {
    const [query, setQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [selectedCats, setSelectedCats] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<(1 | 2 | 3)[]>([]);
    const [openOnly, setOpenOnly] = useState(false);
    const [sort, setSort] = useState<"nearby" | "top" | "popular">("nearby");

    // Segmented control anim
    const sliderX = useRef(new Animated.Value(0)).current;
    const [segWidth, setSegWidth] = useState(0);

    const CATS = useMemo(() => {
        const s = new Set<string>();
        ALL_BIZ.forEach((b) => b.categories.forEach((c) => s.add(c)));
        return Array.from(s).sort();
    }, []);

    // Derived results
    const results = useMemo(() => {
        let list = ALL_BIZ.slice();

        // search
        const q = query.trim().toLowerCase();
        if (q) {
            list = list.filter((b) => {
                const hay = (b.name + " " + b.categories.join(" ") + " " + b.tags.join(" ")).toLowerCase();
                return hay.includes(q);
            });
        }
        // categories
        if (selectedCats.length > 0) {
            list = list.filter((b) => selectedCats.every((c) => b.categories.includes(c)));
        }
        // prices
        if (selectedPrices.length > 0) {
            list = list.filter((b) => selectedPrices.includes(b.price));
        }
        // open now
        if (openOnly) {
            list = list.filter((b) => b.openNow);
        }

        // sort
        if (sort === "nearby") {
            list.sort((a, b) => a.distanceMi - b.distanceMi);
        } else if (sort === "top") {
            list.sort((a, b) => b.rating - a.rating);
        } else if (sort === "popular") {
            list.sort((a, b) => b.reviews - a.reviews);
        }

        return list;
    }, [query, selectedCats, selectedPrices, openOnly, sort]);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 600);
    };

    const toggleCat = (c: string) => {
        setSelectedCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    };

    const togglePrice = (p: 1 | 2 | 3) => {
        setSelectedPrices((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
    };

    const clearAll = () => {
        setSelectedCats([]);
        setSelectedPrices([]);
        setOpenOnly(false);
        setQuery("");
        setSort("nearby");
    };

    // segmented control animation
    const onSegLayout = (w: number) => {
        setSegWidth(w);
        Animated.spring(sliderX, {
            toValue: sort === "nearby" ? 0 : sort === "top" ? w / 3 : (2 * w) / 3,
            useNativeDriver: true,
            bounciness: 6,
        }).start();
    };
    const switchSort = (next: "nearby" | "top" | "popular") => {
        setSort(next);
        if (segWidth > 0) {
            const x = next === "nearby" ? 0 : next === "top" ? segWidth / 3 : (2 * segWidth) / 3;
            Animated.spring(sliderX, { toValue: x, useNativeDriver: true, bounciness: 6 }).start();
        }
    };

    return (
        <View style={styles.container}>
            {/* Search */}
            <View style={styles.searchRow}>
                <Ionicons name="search" size={18} color="#8A8F98" />
                <TextInput
                    placeholder="Search coffee, pizza, vegan..."
                    placeholderTextColor="#8A8F98"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.searchInput}
                    autoCapitalize="none"
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery("")} style={{ padding: 4 }}>
                        <Ionicons name="close-circle" size={18} color="#8A8F98" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Categories */}
            <FlatList
                data={CATS}
                keyExtractor={(c) => c}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingTop: 8, paddingBottom: 2 }}
                renderItem={({ item }) => (
                    <Chip
                        label={item}
                        active={selectedCats.includes(item)}
                        onPress={() => toggleCat(item)}
                        icon="pricetags-outline"
                    />
                )}
            />

            {/* Price + Open + Clear */}
            <View style={styles.filterRow}>
                <PriceChip label="$" active={selectedPrices.includes(1)} onPress={() => togglePrice(1)} />
                <PriceChip label="$$" active={selectedPrices.includes(2)} onPress={() => togglePrice(2)} />
                <PriceChip label="$$$" active={selectedPrices.includes(3)} onPress={() => togglePrice(3)} />

                <View style={{ width: 10 }} />

                <Chip
                    label="Open now"
                    active={openOnly}
                    onPress={() => setOpenOnly((s) => !s)}
                    icon="time-outline"
                />

                <View style={{ flex: 1 }} />

                {(selectedCats.length || selectedPrices.length || openOnly || query) ? (
                    <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
                        <Ionicons name="close" size={14} color="#C8CDD4" />
                        <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Sort segmented */}
            <Segmented
                options={[
                    { key: "nearby", label: "Nearby" },
                    { key: "top", label: "Top Rated" },
                    { key: "popular", label: "Popular" },
                ]}
                value={sort}
                onChange={switchSort}
                onLayoutWidth={onSegLayout}
                sliderX={sliderX}
            />

            {/* Grid */}
            <FlatList
                data={results}
                keyExtractor={(b) => b.id}
                numColumns={2}
                columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 36, gap: 12 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E6E8EB" />
                }
                renderItem={({ item }) => <BusinessCard biz={item} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyTitle}>No results</Text>
                        <Text style={styles.emptySub}>Try changing filters or search terms.</Text>
                    </View>
                }
            />
        </View>
    );
}

// ---------- Components ----------
function Chip({
    label,
    active,
    onPress,
    icon,
}: {
    label: string;
    active?: boolean;
    onPress?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[
                styles.chip,
                active && { backgroundColor: "#1E2632", borderColor: "#283242" },
            ]}
        >
            {icon ? <Ionicons name={icon} size={14} color="#E6E8EB" /> : null}
            <Text style={styles.chipText}>{label}</Text>
        </TouchableOpacity>
    );
}

function PriceChip({
    label,
    active,
    onPress,
}: {
    label: "$" | "$$" | "$$$";
    active?: boolean;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[
                styles.priceChip,
                active && { backgroundColor: "#1E2632", borderColor: "#283242" },
            ]}
        >
            <Text style={[styles.priceText, active && { color: "#E6E8EB" }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function Segmented({
    options,
    value,
    onChange,
    onLayoutWidth,
    sliderX,
}: {
    options: { key: "nearby" | "top" | "popular"; label: string }[];
    value: "nearby" | "top" | "popular";
    onChange: (k: "nearby" | "top" | "popular") => void;
    onLayoutWidth: (w: number) => void;
    sliderX: Animated.Value;
}) {
    return (
        <View
            style={styles.segmentWrap}
            onLayout={(e) => onLayoutWidth(e.nativeEvent.layout.width)}
        >
            <Animated.View
                style={[
                    styles.segmentSlider,
                    { width: `${100 / options.length}%`, transform: [{ translateX: sliderX }] },
                ]}
            />
            {options.map((opt) => {
                const active = value === opt.key;
                return (
                    <TouchableOpacity
                        key={opt.key}
                        style={styles.segmentPart}
                        onPress={() => onChange(opt.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function BusinessCard({ biz }: { biz: Biz }) {
    const priceStr = "$".repeat(biz.price);
    return (
        <Link href={{ pathname: "/establishment/[id]", params: { id: biz.id } }} asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                {/* image */}
                <Image source={{ uri: biz.image }} style={styles.cardImage} />
                {/* overlay badges */}
                <View style={styles.badgeRow}>
                    {biz.hasStudentDeal ? (
                        <View style={[styles.badge, { backgroundColor: ACCENT }]}>
                            <Ionicons name="ticket-outline" size={12} color="#0F1216" />
                            <Text style={[styles.badgeText, { color: "#0F1216" }]}>Student deal</Text>
                        </View>
                    ) : null}
                    {biz.openNow ? (
                        <View style={[styles.badge, { backgroundColor: "#2A7A52" }]}>
                            <Ionicons name="time-outline" size={12} color="#E6E8EB" />
                            <Text style={styles.badgeText}>Open</Text>
                        </View>
                    ) : (
                        <View style={[styles.badge, { backgroundColor: "#3B3F46" }]}>
                            <Ionicons name="moon-outline" size={12} color="#E6E8EB" />
                            <Text style={styles.badgeText}>Closed</Text>
                        </View>
                    )}
                </View>

                {/* info */}
                <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {biz.name}
                    </Text>

                    <View style={styles.rowBetween}>
                        <View style={styles.rowCenter}>
                            {renderStars(biz.rating)}
                            <Text style={styles.metaSmall}> {biz.rating.toFixed(1)}</Text>
                            <Text style={[styles.metaSmall, { color: "#8A8F98" }]}> ({biz.reviews})</Text>
                        </View>
                        <Text style={styles.metaSmall}>{priceStr}</Text>
                    </View>

                    <Text style={styles.meta} numberOfLines={1}>
                        {biz.categories.join(" • ")}
                    </Text>

                    <View style={styles.rowBetween}>
                        <Text style={[styles.metaSmall, { color: "#8A8F98" }]}>
                            {biz.distanceMi.toFixed(1)} mi
                        </Text>
                        {/* tags preview */}
                        <Text style={[styles.metaSmall, { color: "#A8B0BA" }]} numberOfLines={1}>
                            {biz.tags.slice(0, 2).join(" · ")}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}

// ---------- Helpers ----------
function renderStars(rating: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const diff = rating - i;
        let name: keyof typeof Ionicons.glyphMap = "star-outline";
        if (diff >= 0) name = "star";
        else if (diff >= -0.5) name = "star-half";
        stars.push(<Ionicons key={i} name={name} size={14} color="#FFD166" />);
    }
    return <View style={styles.rowCenter}>{stars}</View>;
}

// ---------- Styles ----------
const ACCENT = "#FD2525";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F1216", paddingTop: 50 },

    // search
    searchRow: {
        marginHorizontal: 12,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
        paddingHorizontal: 12,
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: "#E6E8EB",
        fontSize: 14,
        paddingVertical: 6,
    },

    // chips
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 0,
        borderRadius: 999,
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
    },
    chipText: { color: "#E6E8EB", fontWeight: "600", fontSize: 12, paddingVertical: 10 },

    priceChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
    },
    priceText: { color: "#C8CDD4", fontWeight: "700", fontSize: 12 },

    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingTop: 6,
    },
    clearBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#273040",
        backgroundColor: "#1A2029",
    },
    clearText: { color: "#C8CDD4", fontSize: 12 },

    // segmented
    segmentWrap: {
        marginTop: 10,
        marginHorizontal: 12,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
        flexDirection: "row",
        position: "relative",
        overflow: "hidden",
    },
    segmentSlider: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "#1E2632",
        borderRadius: 12,
    },
    segmentPart: { flex: 1, alignItems: "center", justifyContent: "center" },
    segmentText: { color: "#A8B0BA", fontWeight: "600" },
    segmentTextActive: { color: "#E6E8EB" },

    // grid card
    card: {
        flex: 1,
        backgroundColor: "#151A20",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1F2630",
    },
    cardImage: { width: "100%", height: 120, backgroundColor: "#0F141A" },
    badgeRow: {
        position: "absolute",
        top: 8,
        left: 8,
        right: 8,
        flexDirection: "row",
        gap: 6,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeText: { color: "#E6E8EB", fontSize: 10, fontWeight: "700" },

    cardBody: { padding: 10, gap: 6 },
    cardTitle: { color: "#E6E8EB", fontWeight: "700" },
    meta: { color: "#A8B0BA", fontSize: 12 },
    metaSmall: { color: "#E6E8EB", fontSize: 12, fontWeight: "600" },

    rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    rowCenter: { flexDirection: "row", alignItems: "center" },

    // empty
    empty: { alignItems: "center", marginTop: 48, paddingHorizontal: 24 },
    emptyTitle: { color: "#E6E8EB", fontWeight: "700", fontSize: 16 },
    emptySub: { color: "#8A8F98", marginTop: 6, textAlign: "center" },
});
