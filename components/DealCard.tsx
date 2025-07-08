// components/DealCard.tsx
import React from "react";
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// React Native docs: https://reactnative.dev/docs/components
// This component renders both featured and nearby deal cards.

type DealCardProps = {
    title: string;
    description: string;
    image: ImageSourcePropType;
    onPress?: () => void;
    cardWidth?: number; // optional width override
};

export default function DealCard({
    title,
    description,
    image,
    onPress,
    cardWidth,
}: DealCardProps) {
    return (
        <View style={[styles.card, cardWidth ? { width: cardWidth } : null]}>
            <Image source={image} style={styles.image} resizeMode="cover" />
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={onPress}
                >
                    <Text style={styles.buttonText}>View Deal</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1F2937", // gray-800
        borderRadius: 24,
        overflow: "hidden",
        marginRight: 16,
    },
    image: {
        width: "100%",
        height: 144,
    },
    content: {
        padding: 12,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    description: {
        color: "#D1D5DB", // gray-300
        fontSize: 14,
        marginTop: 4,
    },
    button: {
        marginTop: 12,
        backgroundColor: "#FD2525",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "500",
        marginRight: 4,
    },
});
