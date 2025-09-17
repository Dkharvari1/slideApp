// app/establishment/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

const { width } = Dimensions.get("window");
const ACCENT = "#FD2525";

// ---------- Types ----------
type Hours = {
    // 0=Sun ... 6=Sat
    [dayIndex: number]: { open: string; close: string } | null; // "HH:MM" 24h or null if closed
};

type Special = {
    id: string;
    title: string;
    description: string;
    valid?: string; // e.g., "Mon–Thu", "Until Sep 30"
};

type Review = {
    id: string;
    author: string;
    handle: string;
    timeAgo: string;
    rating: number;
    text: string;
    upvotes: number;
    comments: number;
};

type Establishment = {
    id: string;
    name: string;
    images: string[];
    rating: number;
    reviews: number;
    price: 1 | 2 | 3;
    categories: string[];
    tags: string[];
    distanceMi: number;
    hasStudentDeal?: boolean;

    phone?: string;
    website?: string;
    address?: string;
    lat: number;
    lng: number;
    hours: Hours;

    specials?: Special[];
    features?: string[];
    feed?: Review[];
};

// ---------- Mock DB ----------
const EST_DB: Record<string, Establishment> = {
    "jamjar-cafe": {
        id: "jamjar-cafe",
        name: "JamJar Café",
        images: [
            "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1600&auto=format&fit=crop",
        ],
        rating: 4.6,
        reviews: 421,
        price: 2,
        categories: ["Coffee", "Bakery"],
        tags: ["Cardamom Bun", "Cold Brew", "Study Friendly"],
        distanceMi: 0.3,
        hasStudentDeal: true,
        phone: "+1-312-555-0199",
        website: "https://example.com/jamjar",
        address: "901 W Taylor St, Chicago, IL",
        lat: 41.8719,
        lng: -87.6498,
        hours: makeHours({ open: "07:30", close: "20:00" }, { open: "08:00", close: "18:00" }),
        specials: [
            {
                id: "s1",
                title: "15% off with student ID",
                description: "Valid on drinks and pastries. One per day.",
                valid: "Mon–Fri",
            },
            {
                id: "s2",
                title: "Free flavor shot",
                description: "Add vanilla or hazelnut to any coffee.",
            },
        ],
        features: ["Wi-Fi", "Outlets", "Outdoor Seating", "Gluten-Friendly Options"],
        feed: [
            {
                id: "r1",
                author: "Aarav Patel",
                handle: "@aarav",
                timeAgo: "2h",
                rating: 5,
                text: "Cardamom bun + cold brew is elite. Staff is super nice.",
                upvotes: 18,
                comments: 3,
            },
            {
                id: "r2",
                author: "Mia Chen",
                handle: "@mchen",
                timeAgo: "1d",
                rating: 4,
                text: "Great study spot but gets busy after 10:30.",
                upvotes: 9,
                comments: 1,
            },
        ],
    },
    "tikka-town": {
        id: "tikka-town",
        name: "Tikka Town",
        images: [
            "https://images.unsplash.com/photo-1604908554024-0c2a2b58c8b6?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1605478440769-7f94d8ea6c22?q=80&w=1600&auto=format&fit=crop",
        ],
        rating: 4.2,
        reviews: 318,
        price: 2,
        categories: ["Indian", "Casual"],
        tags: ["Butter Chicken", "Garlic Naan"],
        distanceMi: 0.9,
        hasStudentDeal: true,
        phone: "+1-312-555-0144",
        website: "https://example.com/tikka",
        address: "1101 W Polk St, Chicago, IL",
        lat: 41.8696,
        lng: -87.6515,
        hours: makeHours({ open: "11:00", close: "22:00" }),
        specials: [
            {
                id: "s3",
                title: "BOGO 50% off bowls",
                description: "Second bowl half off with valid student ID.",
                valid: "Tue–Thu",
            },
        ],
        features: ["Vegetarian Options", "Halal", "Takeout", "Delivery"],
        feed: [
            {
                id: "r3",
                author: "Leo Martinez",
                handle: "@leom",
                timeAgo: "3h",
                rating: 4,
                text: "Butter chicken hits every time. Medium spice = perfect.",
                upvotes: 12,
                comments: 2,
            },
        ],
    },
    "green-leaf": {
        id: "green-leaf",
        name: "Green Leaf",
        images: [
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
        ],
        rating: 4.8,
        reviews: 510,
        price: 2,
        categories: ["Healthy", "Cafe"],
        tags: ["Matcha", "Pesto Panini", "Quiet"],
        distanceMi: 1.4,
        phone: "+1-312-555-0166",
        website: "https://example.com/greenleaf",
        address: "1201 S Halsted St, Chicago, IL",
        lat: 41.8731,
        lng: -87.6475,
        hours: makeHours({ open: "08:00", close: "17:00" }, { open: "09:00", close: "15:00" }),
        features: ["Vegan Options", "Wi-Fi", "Quiet Corners"],
        feed: [],
    },
};

// Helper to build weekly hours (same for Mon–Fri, optional weekend hours)
function makeHours(
    weekday: { open: string; close: string },
    weekend?: { open: string; close: string }
): Hours {
    const h: Hours = {
        0: weekend ?? null, // Sun
        1: weekday, // Mon
        2: weekday, // Tue
        3: weekday, // Wed
        4: weekday, // Thu
        5: weekday, // Fri
        6: weekend ?? null, // Sat
    };
    return h;
}

// ---------- Page ----------
export default function EstablishmentPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const est = EST_DB[id ?? ""] as Establishment | undefined;

    const [saved, setSaved] = useState(false);
    const [openComposerFor, setOpenComposerFor] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const [votes, setVotes] = useState<Record<string, { status: -1 | 0 | 1; score: number }>>({});

    const openInfo = useMemo(() => (est ? getOpenInfo(est.hours) : null), [est]);

    if (!est) {
        return (
            <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
                <Text style={{ color: "#E6E8EB", fontSize: 16, marginBottom: 12 }}>Not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Go back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const region: Region = {
        latitude: est.lat,
        longitude: est.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `Check out ${est.name} on Slide — ${est.categories.join(
                    " • "
                )}  https://slide.app/establishment/${est.id}`,
            });
        } catch { }
    };

    const onCall = async () => {
        if (!est.phone) return;
        Linking.openURL(`tel:${est.phone}`);
    };

    const onWebsite = async () => {
        if (!est.website) return;
        Linking.openURL(est.website);
    };

    const onDirections = async () => {
        const url = Platform.select({
            ios: `http://maps.apple.com/?daddr=${est.lat},${est.lng}`,
            android: `geo:${est.lat},${est.lng}?q=${encodeURIComponent(est.name)}`,
            default: `https://www.google.com/maps/search/?api=1&query=${est.lat},${est.lng}`,
        });
        if (url) Linking.openURL(url);
    };

    const handleVote = (review: Review, dir: -1 | 1) => {
        setVotes((prev) => {
            const current = prev[review.id] ?? { status: 0 as -1 | 0 | 1, score: review.upvotes };
            let nextStatus: -1 | 0 | 1 = current.status;
            let nextScore = current.score;

            if (dir === 1) {
                if (current.status === 1) {
                    nextStatus = 0;
                    nextScore = current.score - 1;
                } else if (current.status === -1) {
                    nextStatus = 1;
                    nextScore = current.score + 2;
                } else {
                    nextStatus = 1;
                    nextScore = current.score + 1;
                }
            } else {
                if (current.status === -1) {
                    nextStatus = 0;
                    nextScore = current.score + 1;
                } else if (current.status === 1) {
                    nextStatus = -1;
                    nextScore = current.score - 2;
                } else {
                    nextStatus = -1;
                    nextScore = current.score - 1;
                }
            }
            return { ...prev, [review.id]: { status: nextStatus, score: nextScore } };
        });
    };

    const submitComment = (review: Review) => {
        if (!draft.trim()) return;
        setDraft("");
        setOpenComposerFor(null);
        Alert.alert("Comment posted", "Your comment was added (mock).");
    };

    return (
        <View style={styles.container}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#E6E8EB" />
                </TouchableOpacity>
                <Text style={styles.topTitle} numberOfLines={1}>
                    {est.name}
                </Text>
                <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
                    <Ionicons name="share-outline" size={20} color="#E6E8EB" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                {/* Image carousel */}
                <ImageCarousel images={est.images} />

                {/* Title + meta */}
                <View style={styles.header}>
                    <Text style={styles.name}>{est.name}</Text>
                    <View style={styles.rowWrap}>
                        <View style={styles.rowCenter}>
                            {renderStars(est.rating)}
                            <Text style={styles.metaStrong}> {est.rating.toFixed(1)}</Text>
                            <Text style={styles.metaFaint}> ({est.reviews})</Text>
                        </View>
                        <Dot />
                        <Text style={styles.metaStrong}>{"$".repeat(est.price)}</Text>
                        <Dot />
                        <Text style={styles.meta}>{est.categories.join(" • ")}</Text>
                    </View>

                    <View style={[styles.rowWrap, { marginTop: 6 }]}>
                        <Text style={styles.metaFaint}>{est.distanceMi.toFixed(1)} mi away</Text>
                        <Dot />
                        {openInfo ? (
                            <Text style={[styles.metaStrong, { color: openInfo.open ? "#2A7A52" : "#C96A6A" }]}>
                                {openInfo.open ? "Open now" : "Closed"}{" "}
                                <Text style={styles.metaFaint}>
                                    {openInfo.nextText ? `· ${openInfo.nextText}` : ""}
                                </Text>
                            </Text>
                        ) : null}
                    </View>

                    {est.hasStudentDeal ? (
                        <View style={styles.dealCard}>
                            <View style={styles.dealBadge}>
                                <Ionicons name="ticket-outline" size={14} color="#0F1216" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.dealTitle}>Exclusive student deals available</Text>
                                <Text style={styles.dealSub}>Verify your student status to redeem in-store.</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => Alert.alert("Redeem", "Student verification not wired yet.")}
                                style={styles.redeemBtn}
                            >
                                <Text style={styles.redeemText}>Redeem</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>

                {/* Quick actions */}
                <View style={styles.actionsRow}>
                    <Action icon="call-outline" label="Call" onPress={onCall} />
                    <Action icon="navigate-outline" label="Directions" onPress={onDirections} />
                    <Action icon="globe-outline" label="Website" onPress={onWebsite} />
                    <Action
                        icon={saved ? "heart" : "heart-outline"}
                        label={saved ? "Saved" : "Save"}
                        onPress={() => setSaved((s) => !s)}
                        active={saved}
                    />
                </View>

                {/* Specials */}
                {est.specials && est.specials.length > 0 ? (
                    <Section title="Specials">
                        {est.specials.map((s) => (
                            <View key={s.id} style={styles.specialCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.specialTitle}>{s.title}</Text>
                                    <Text style={styles.specialText}>{s.description}</Text>
                                    {s.valid ? <Text style={styles.specialValid}>{s.valid}</Text> : null}
                                </View>
                                <TouchableOpacity
                                    style={styles.specialBtn}
                                    onPress={() => Alert.alert("Show QR", "QR redemption flow not wired yet.")}
                                >
                                    <Ionicons name="qr-code-outline" size={18} color="#0F1216" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </Section>
                ) : null}

                {/* Features */}
                {est.features && est.features.length > 0 ? (
                    <Section title="Features">
                        <View style={styles.chipsRow}>
                            {est.features.map((f) => (
                                <Chip key={f} label={f} />
                            ))}
                        </View>
                    </Section>
                ) : null}

                {/* Hours */}
                <Section title="Hours">
                    <View style={styles.hoursTable}>
                        {Array.from({ length: 7 }).map((_, idx) => {
                            const di = idx; // 0..6
                            const row = est.hours[di];
                            const isToday = new Date().getDay() === di;
                            return (
                                <View key={di} style={styles.hoursRow}>
                                    <Text style={[styles.hoursDay, isToday && { color: "#E6E8EB", fontWeight: "700" }]}>
                                        {dayName(di)}
                                    </Text>
                                    <Text style={styles.hoursTime}>
                                        {row ? `${toAmPm(row.open)} – ${toAmPm(row.close)}` : "Closed"}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </Section>

                {/* Location */}
                <Section title="Location">
                    <View style={styles.mapWrap}>
                        <MapView
                            style={StyleSheet.absoluteFill}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={region}
                            customMapStyle={darkMapStyle}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker
                                coordinate={{ latitude: est.lat, longitude: est.lng }}
                                title={est.name}
                                description={est.address}
                            >
                                <View style={styles.pin}>
                                    <Ionicons name="location" size={16} color="#0F1216" />
                                </View>
                            </Marker>
                        </MapView>
                    </View>
                    {est.address ? <Text style={styles.address}>{est.address}</Text> : null}
                </Section>

                {/* Reviews */}
                <Section title="Reviews">
                    {est.feed && est.feed.length > 0 ? (
                        est.feed.map((r) => {
                            const v = votes[r.id] ?? { status: 0 as -1 | 0 | 1, score: r.upvotes };
                            const isOpen = openComposerFor === r.id;
                            const initials = r.author
                                .split(" ")
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase();
                            return (
                                <View key={r.id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{initials}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.author}>{r.author}</Text>
                                            <Text style={styles.metaFaint}>
                                                {r.handle} · {r.timeAgo}
                                            </Text>
                                        </View>
                                        <View style={styles.rowCenter}>
                                            {renderStars(r.rating, 14)}
                                            <Text style={[styles.metaStrong, { marginLeft: 4 }]}>{r.rating.toFixed(1)}</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.reviewText}>{r.text}</Text>

                                    <View style={styles.actionsRowInline}>
                                        <TouchableOpacity style={styles.actionBtnInline} onPress={() => handleVote(r, 1)}>
                                            <Ionicons
                                                name={v.status === 1 ? "arrow-up-circle" : "arrow-up-circle-outline"}
                                                size={20}
                                                color={v.status === 1 ? ACCENT : "#C8CDD4"}
                                            />
                                            <Text
                                                style={[
                                                    styles.actionTextInline,
                                                    v.status === 1 && { color: ACCENT, fontWeight: "700" },
                                                ]}
                                            >
                                                {v.score}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.actionBtnInline} onPress={() => handleVote(r, -1)}>
                                            <Ionicons
                                                name={v.status === -1 ? "arrow-down-circle" : "arrow-down-circle-outline"}
                                                size={20}
                                                color={v.status === -1 ? "#7AA2FF" : "#C8CDD4"}
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.actionBtnInline}
                                            onPress={() => setOpenComposerFor((id) => (id === r.id ? null : r.id))}
                                        >
                                            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#C8CDD4" />
                                            <Text style={styles.actionTextInline}>{r.comments}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {isOpen && (
                                        <View style={{ marginTop: 10 }}>
                                            <TextInput
                                                value={draft}
                                                onChangeText={setDraft}
                                                placeholder="Add a comment..."
                                                placeholderTextColor="#8A8F98"
                                                style={styles.input}
                                                multiline
                                            />
                                            <View style={{ height: 8 }} />
                                            <TouchableOpacity style={styles.primaryBtn} onPress={() => submitComment(r)}>
                                                <Text style={styles.primaryBtnText}>Post</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.metaFaint}>No reviews yet.</Text>
                    )}
                </Section>
            </ScrollView>
        </View>
    );
}

// ---------- Components ----------
function ImageCarousel({ images }: { images: string[] }) {
    const [index, setIndex] = useState(0);
    const viewable = useRef({ viewAreaCoveragePercentThreshold: 60 });

    return (
        <View>
            <FlatList
                data={images}
                keyExtractor={(u, i) => u + i}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <Image source={{ uri: item }} style={styles.hero} />}
                onViewableItemsChanged={useRef(({ viewableItems }) => {
                    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
                }).current}
                viewabilityConfig={viewable.current}
            />
            <View style={styles.dots}>
                {images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
            </View>
        </View>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

function Action({
    icon,
    label,
    onPress,
    active,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    active?: boolean;
}) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.action, active && styles.actionActive]}>
            <Ionicons name={icon} size={18} color={active ? "#0F1216" : "#E6E8EB"} />
            <Text style={[styles.actionLabel, active && { color: "#0F1216" }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function Chip({ label }: { label: string }) {
    return (
        <View style={styles.chip}>
            <Text style={styles.chipText}>{label}</Text>
        </View>
    );
}

// ---------- Helpers ----------
function renderStars(rating: number, size = 16) {
    const nodes = [];
    for (let i = 1; i <= 5; i++) {
        const diff = rating - i;
        let name: keyof typeof Ionicons.glyphMap = "star-outline";
        if (diff >= 0) name = "star";
        else if (diff >= -0.5) name = "star-half";
        nodes.push(<Ionicons key={i} name={name} size={size} color="#FFD166" />);
    }
    return <View style={{ flexDirection: "row", alignItems: "center" }}>{nodes}</View>;
}

function dayName(i: number) {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];
}

function toAmPm(hhmm: string) {
    const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
    const am = h < 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${am ? "AM" : "PM"}`;
}

function getOpenInfo(hours: Hours) {
    const now = new Date();
    const day = now.getDay();
    const today = hours[day];
    if (!today) {
        // closed today -> show next open day
        const next = nextOpen(hours, day);
        return { open: false, nextText: next ? `Opens ${next.when} ${toAmPm(next.open)}` : "" };
    }
    const cur = now.getHours() * 60 + now.getMinutes();
    const o = parseHM(today.open);
    const c = parseHM(today.close);
    if (cur >= o && cur < c) {
        // open now -> show closes at
        return { open: true, nextText: `Closes ${toAmPm(today.close)}` };
    } else if (cur < o) {
        // opens later today
        return { open: false, nextText: `Opens today ${toAmPm(today.open)}` };
    } else {
        // already closed -> show next day opening
        const next = nextOpen(hours, day);
        return { open: false, nextText: next ? `Opens ${next.when} ${toAmPm(next.open)}` : "" };
    }
}

function nextOpen(hours: Hours, fromDay: number) {
    for (let i = 1; i <= 7; i++) {
        const di = (fromDay + i) % 7;
        if (hours[di]) {
            return { when: dayName(di), open: parseInt(hours[di]!.open.replace(":", ""), 10) ? hours[di]!.open : "09:00" };
        }
    }
    return null;
}

function parseHM(hhmm: string) {
    const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
    return h * 60 + m;
}

// Subtle dark map styling
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0b0f14" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#a0a8b3" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f14" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#a0a8b3" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0f141a" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#151a20" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8f98" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f141a" }] },
];

// ---------- Styles ----------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F1216" },
    topBar: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2630",
        marginTop: 50
    },
    iconBtn: { height: 44, width: 44, alignItems: "center", justifyContent: "center" },
    topTitle: { color: "#E6E8EB", fontWeight: "700", fontSize: 16, flex: 1, textAlign: "center" },

    hero: { width, height: width * 0.62, backgroundColor: "#0F141A" },
    dots: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
    },
    dot: { height: 6, width: 6, borderRadius: 3, backgroundColor: "#3a4250" },
    dotActive: { backgroundColor: "#E6E8EB" },

    header: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
    name: { color: "#E6E8EB", fontSize: 22, fontWeight: "800" },
    rowWrap: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
    rowCenter: { flexDirection: "row", alignItems: "center" },
    meta: { color: "#A8B0BA" },
    metaFaint: { color: "#8A8F98" },
    metaStrong: { color: "#E6E8EB", fontWeight: "700" },
    dealCard: {
        marginTop: 10,
        padding: 12,
        borderRadius: 14,
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    dealBadge: {
        height: 28,
        width: 28,
        borderRadius: 14,
        backgroundColor: ACCENT,
        alignItems: "center",
        justifyContent: "center",
    },
    dealTitle: { color: "#E6E8EB", fontWeight: "700" },
    dealSub: { color: "#8A8F98", marginTop: 2 },
    redeemBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: ACCENT,
        borderRadius: 999,
    },
    redeemText: { color: "#0F1216", fontWeight: "700" },

    actionsRow: {
        marginTop: 14,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    action: {
        alignItems: "center",
        gap: 6,
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        width: (width - 12 * 2 - 10 * 3) / 4,
    },
    actionActive: { backgroundColor: ACCENT, borderColor: ACCENT },
    actionLabel: { color: "#E6E8EB", fontWeight: "700", fontSize: 12 },

    section: { paddingHorizontal: 16, marginTop: 18 },
    sectionTitle: { color: "#E6E8EB", fontWeight: "800", marginBottom: 10, fontSize: 16 },

    specialCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
        marginBottom: 10,
    },
    specialTitle: { color: "#E6E8EB", fontWeight: "700" },
    specialText: { color: "#C8CDD4", marginTop: 2 },
    specialValid: { color: "#8A8F98", marginTop: 2, fontSize: 12 },
    specialBtn: {
        height: 36,
        width: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#E6E8EB",
    },

    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "#1E2632",
        borderWidth: 1,
        borderColor: "#283242",
    },
    chipText: { color: "#E6E8EB", fontWeight: "600", fontSize: 12 },

    hoursTable: {
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
        borderRadius: 12,
        padding: 10,
    },
    hoursRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
    hoursDay: { color: "#C8CDD4" },
    hoursTime: { color: "#E6E8EB", fontWeight: "600" },

    mapWrap: {
        height: 160,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1F2630",
    },
    address: { color: "#C8CDD4", marginTop: 10 },

    pin: {
        backgroundColor: ACCENT,
        borderRadius: 999,
        padding: 6,
        borderWidth: 2,
        borderColor: "#0F1216",
    },

    // Reviews
    reviewCard: {
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
    avatar: {
        height: 36,
        width: 36,
        borderRadius: 18,
        backgroundColor: "#222A35",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { color: "#E6E8EB", fontWeight: "700" },
    author: { color: "#E6E8EB", fontWeight: "700" },
    reviewText: { color: "#C8CDD4", marginTop: 6, lineHeight: 20 },

    actionsRowInline: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 },
    actionBtnInline: { flexDirection: "row", alignItems: "center", gap: 6 },
    actionTextInline: { color: "#C8CDD4", fontWeight: "700" },

    input: {
        minHeight: 44,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#0F141A",
        borderWidth: 1,
        borderColor: "#222A35",
        color: "#E6E8EB",
    },

    primaryBtn: {
        height: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ACCENT,
    },
    primaryBtnText: { color: "#0F1216", fontWeight: "700" },

    dotSep: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#3a4250", marginHorizontal: 6 },
});

function Dot() {
    return <View style={styles.dotSep} />;
}
