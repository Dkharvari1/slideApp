// app/(tabs)/home.tsx
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Image,
    LayoutChangeEvent,
    RefreshControl,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * Home feed with "Following" / "For You" toggle.
 * Each post shows: linked business profile, image, star rating, header, description,
 * upvote, downvote, comment count, and share button.
 */

// ----- Types -----
type Review = {
    id: string;
    author: string;
    handle: string;
    timeAgo: string;

    businessId: string;
    businessName: string;
    businessLogo?: string;
    image?: string;

    rating: number; // 0..5 (supports halves, e.g. 4.5)
    title: string; // header
    text: string; // description

    upvotes: number;
    comments: number;
};

// ----- Mock Data -----
const followingReviews: Review[] = [
    {
        id: "r1",
        author: "Aarav Patel",
        handle: "@aarav",
        timeAgo: "2h",
        businessId: "jamjar-cafe",
        businessName: "JamJar Café",
        businessLogo: undefined,
        image:
            "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1600&auto=format&fit=crop",
        rating: 4.5,
        title: "Cardamom bun + cold brew = elite combo",
        text:
            "Insane cold brew and the student discount is actually real. The cardamom bun is a must. Vibes are immaculate for studying.",
        upvotes: 42,
        comments: 9,
    },
    {
        id: "r2",
        author: "Mia Chen",
        handle: "@mchen",
        timeAgo: "5h",
        businessId: "tikka-town",
        businessName: "Tikka Town",
        image:
            "https://images.unsplash.com/photo-1604908554024-0c2a2b58c8b6?q=80&w=1600&auto=format&fit=crop",
        rating: 4,
        title: "Butter chicken hits every time",
        text:
            "Portions are generous with the Slide deal. Garlic naan is elite. Ask for medium spice for balance.",
        upvotes: 31,
        comments: 5,
    },
    {
        id: "r3",
        author: "Leo Martinez",
        handle: "@leom",
        timeAgo: "1d",
        businessId: "campus-bites",
        businessName: "Campus Bites",
        image:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop",
        rating: 3,
        title: "Good value—plan around the lunch rush",
        text:
            "Solid portions for the price, but the line is brutal 12–1. Go before 11:30 or after 1:30.",
        upvotes: 12,
        comments: 3,
    },
];

const forYouReviews: Review[] = [
    {
        id: "r4",
        author: "Sophia Rossi",
        handle: "@soph",
        timeAgo: "1h",
        businessId: "green-leaf",
        businessName: "Green Leaf",
        image:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop",
        rating: 5,
        title: "Pesto panini + iced matcha study fuel",
        text:
            "Quiet corner seating = study heaven. Staff was super kind about laptop time. Outlets along the back wall.",
        upvotes: 57,
        comments: 14,
    },
    {
        id: "r5",
        author: "Noah Johnson",
        handle: "@noahj",
        timeAgo: "8h",
        businessId: "pressed-co",
        businessName: "Pressed & Co.",
        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
        rating: 4,
        title: "Acai bowl + cocoa nibs for the win",
        text:
            "Cocoa nibs add crunch without being too sweet. Great post-gym option on the way to class.",
        upvotes: 22,
        comments: 2,
    },
];

// ----- Home Screen -----
export default function Home() {
    const [tab, setTab] = useState<"following" | "forYou">("following");
    const [refreshing, setRefreshing] = useState(false);

    // Local state for votes and comments (by review id)
    const [votes, setVotes] = useState<Record<string, { status: -1 | 0 | 1; score: number }>>({});
    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
    const [openComposerFor, setOpenComposerFor] = useState<string | null>(null);
    const [draftComment, setDraftComment] = useState("");

    // Segmented control animation
    const sliderX = useRef(new Animated.Value(0)).current;
    const [segWidth, setSegWidth] = useState(0);

    const data = useMemo(
        () => (tab === "following" ? followingReviews : forYouReviews),
        [tab]
    );

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 700);
    };

    const onSegmentLayout = (e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        setSegWidth(w);
        Animated.spring(sliderX, {
            toValue: tab === "following" ? 0 : w / 2,
            useNativeDriver: true,
            bounciness: 6,
        }).start();
    };

    const switchTab = (next: "following" | "forYou") => {
        setTab(next);
        if (segWidth > 0) {
            Animated.spring(sliderX, {
                toValue: next === "following" ? 0 : segWidth / 2,
                useNativeDriver: true,
                bounciness: 6,
            }).start();
        }
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

    const handleOpenComment = (reviewId: string) => {
        setOpenComposerFor((id) => (id === reviewId ? null : reviewId));
        setDraftComment("");
    };

    const handleSubmitComment = (review: Review) => {
        if (!draftComment.trim()) return;
        setCommentCounts((prev) => {
            const existing = prev[review.id] ?? review.comments;
            return { ...prev, [review.id]: existing + 1 };
        });
        setDraftComment("");
        setOpenComposerFor(null);
    };

    const handleShare = async (review: Review) => {
        try {
            await Share.share({
                message: `Slide review for ${review.businessName} — ${review.title}\n${review.text}\nhttps://slide.app/review/${review.id}`,
            });
        } catch {
            // no-op
        }
    };

    return (
        <View style={styles.container}>
            {/* Segmented control */}
            <View style={styles.segmentWrap} onLayout={onSegmentLayout}>
                <Animated.View
                    style={[
                        styles.segmentSlider,
                        {
                            width: "50%",
                            transform: [{ translateX: sliderX }],
                        },
                    ]}
                />
                <TouchableOpacity
                    style={styles.segmentHalf}
                    onPress={() => switchTab("following")}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            tab === "following" ? styles.segmentTextActive : undefined,
                        ]}
                    >
                        Following
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.segmentHalf}
                    onPress={() => switchTab("forYou")}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            tab === "forYou" ? styles.segmentTextActive : undefined,
                        ]}
                    >
                        For You
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Feed */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E6E8EB" />
                }
                renderItem={({ item }) => {
                    const v = votes[item.id] ?? { status: 0 as -1 | 0 | 1, score: item.upvotes };
                    const c = commentCounts[item.id] ?? item.comments;
                    const isOpen = openComposerFor === item.id;
                    return (
                        <ReviewCard
                            review={item}
                            voteStatus={v.status}
                            score={v.score}
                            comments={c}
                            onUpvote={() => handleVote(item, 1)}
                            onDownvote={() => handleVote(item, -1)}
                            onComment={() => handleOpenComment(item.id)}
                            isComposerOpen={isOpen}
                            draft={draftComment}
                            setDraft={setDraftComment}
                            onSubmit={() => handleSubmitComment(item)}
                            onShare={() => handleShare(item)}
                        />
                    );
                }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyTitle}>
                            {tab === "following" ? "No reviews yet" : "No recommendations yet"}
                        </Text>
                        <Text style={styles.emptySub}>
                            {tab === "following"
                                ? "Follow some friends to see their latest reviews."
                                : "We’ll surface recommended spots for you soon."}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

// ----- Review Card Component -----
type CardProps = {
    review: Review;
    voteStatus: -1 | 0 | 1;
    score: number;
    comments: number;
    onUpvote: () => void;
    onDownvote: () => void;
    onComment: () => void;
    isComposerOpen: boolean;
    draft: string;
    setDraft: (t: string) => void;
    onSubmit: () => void;
    onShare: () => void;
};

function ReviewCard({
    review,
    voteStatus,
    score,
    comments,
    onUpvote,
    onDownvote,
    onComment,
    isComposerOpen,
    draft,
    setDraft,
    onSubmit,
    onShare,
}: CardProps) {
    const initials = review.author
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <View style={styles.card}>
            {/* Header: Author + time + more */}
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.author}>{review.author}</Text>
                    <Text style={styles.meta}>
                        {review.handle} · {review.timeAgo}
                    </Text>
                </View>
                {/* Share */}
                <TouchableOpacity style={styles.iconBtn} onPress={onShare} accessibilityLabel="Share post">
                    <Ionicons name="share-outline" size={20} color="#C8CDD4" />
                </TouchableOpacity>
            </View>

            {/* Linked business chip */}
            <Link
                href={{ pathname: "/establishment/[id]", params: { id: review.businessId } }}
                asChild
            >
                <TouchableOpacity activeOpacity={0.8} style={styles.bizChip}>
                    <Ionicons name="storefront-outline" size={16} color="#E6E8EB" />
                    <Text style={styles.bizName}>{review.businessName}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#8A8F98" />
                </TouchableOpacity>
            </Link>

            {/* Image */}
            {review.image ? (
                <Link
                    href={{ pathname: "/establishment/[id]", params: { id: review.businessId } }}
                    asChild
                >
                    <TouchableOpacity activeOpacity={0.9}>
                        <Image source={{ uri: review.image }} style={styles.image} />
                    </TouchableOpacity>
                </Link>
            ) : null}

            {/* Title / Header */}
            <Text style={styles.title}>{review.title}</Text>

            {/* Star rating */}
            <View style={styles.starsRow}>{renderStars(review.rating)}</View>

            {/* Description */}
            <Text style={styles.text}>{review.text}</Text>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={onUpvote}
                    accessibilityRole="button"
                    accessibilityLabel="Upvote review"
                >
                    <Ionicons
                        name={voteStatus === 1 ? "arrow-up-circle" : "arrow-up-circle-outline"}
                        size={22}
                        color={voteStatus === 1 ? ACCENT : "#C8CDD4"}
                    />
                    <Text
                        style={[
                            styles.actionText,
                            { marginLeft: 6 },
                            voteStatus === 1 && { color: ACCENT },
                        ]}
                    >
                        {score}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={onDownvote}
                    accessibilityRole="button"
                    accessibilityLabel="Downvote review"
                >
                    <Ionicons
                        name={voteStatus === -1 ? "arrow-down-circle" : "arrow-down-circle-outline"}
                        size={22}
                        color={voteStatus === -1 ? "#7AA2FF" : "#C8CDD4"}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={onComment}
                    accessibilityRole="button"
                    accessibilityLabel="Comment on review"
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#C8CDD4" />
                    <Text style={[styles.actionText, { marginLeft: 6 }]}>{comments}</Text>
                </TouchableOpacity>
            </View>

            {/* Comment composer */}
            {isComposerOpen && (
                <View style={styles.composer}>
                    <TextInput
                        value={draft}
                        onChangeText={setDraft}
                        placeholder="Add a comment..."
                        placeholderTextColor="#8A8F98"
                        style={styles.input}
                        multiline
                    />
                    <View style={{ height: 8 }} />
                    <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit}>
                        <Text style={styles.primaryBtnText}>Post</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

// ----- Helpers -----
function renderStars(rating: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const diff = rating - i;
        let name: keyof typeof Ionicons.glyphMap = "star-outline";
        if (diff >= 0) name = "star";
        else if (diff >= -0.5) name = "star-half";
        stars.push(<Ionicons key={i} name={name} size={16} color="#FFD166" />);
    }
    return stars;
}

// ----- Styles -----
const ACCENT = "#FD2525";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F1216",
        paddingTop: 50,
    },
    segmentWrap: {
        marginTop: 10,
        marginHorizontal: 16,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#151A20",
        borderWidth: 1,
        borderColor: "#1F2630",
        flexDirection: "row",
        position: "relative",
        overflow: "hidden",
        marginBottom: 10,
    },
    segmentSlider: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "#FD2525",
        borderRadius: 12,
    },
    segmentHalf: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    segmentText: { color: "#A8B0BA", fontWeight: "600" },
    segmentTextActive: { color: "#E6E8EB" },

    card: {
        backgroundColor: "#151A20",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#1F2630",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 12,
    },
    avatar: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: "#222A35",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { color: "#E6E8EB", fontWeight: "700" },
    author: { color: "#E6E8EB", fontWeight: "700" },
    meta: { color: "#8A8F98", fontSize: 12 },

    bizChip: {
        marginTop: 2,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#1E2632",
        borderWidth: 1,
        borderColor: "#283242",
    },
    bizName: { color: "#E6E8EB", fontWeight: "600" },

    image: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 8,
        backgroundColor: "#0F141A",
    },

    title: {
        color: "#E6E8EB",
        fontWeight: "700",
        fontSize: 16,
        marginTop: 4,
    },
    starsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        marginTop: 6,
        marginBottom: 6,
    },
    text: { color: "#C8CDD4", lineHeight: 20 },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 18,
        marginTop: 10,
    },
    actionBtn: { flexDirection: "row", alignItems: "center" },
    actionText: { color: "#C8CDD4", fontWeight: "600" },
    iconBtn: { padding: 6 },

    composer: {
        marginTop: 12,
    },
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

    empty: {
        alignItems: "center",
        marginTop: 48,
        paddingHorizontal: 24,
    },
    emptyTitle: { color: "#E6E8EB", fontWeight: "700", fontSize: 16 },
    emptySub: { color: "#8A8F98", marginTop: 6, textAlign: "center" },
});
