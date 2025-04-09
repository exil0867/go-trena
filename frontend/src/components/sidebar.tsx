import React, { useRef, useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Animated,
    Pressable,
    StyleSheet,
    Modal,
    FlatList,
    ActivityIndicator
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { supabase } from "@/api/supabase";
import { useAppContext } from "../context/AppContext"; // Make sure this path is correct

export default function Sidebar({ sidebarVisible, width }) {
    const sidebarAnimatedWidth = useRef(
        new Animated.Value(sidebarVisible ? width : 0)
    ).current;

    const { colorScheme } = useColorScheme();
    const [activityMenuVisible, setActivityMenuVisible] = useState(false);

    // Get the activities data from your context
    const {
        activities,
        selectedActivity,
        setSelectedActivity,
        refreshActivities,
        isLoading
    } = useAppContext();

    // Animate width on prop change
    useEffect(() => {
        Animated.timing(sidebarAnimatedWidth, {
            toValue: sidebarVisible ? width : 0,
            duration: 200,
            useNativeDriver: false, // required for width animations
        }).start();
    }, [sidebarVisible, width]);

    const NavLink = ({ href, iconName, label }) => (
        <Link href={href} asChild>
            <Pressable style={styles.navLink}>
                <Ionicons
                    name={iconName}
                    size={20}
                    style={[styles.icon, colorScheme === "dark" && styles.iconDark]}
                />
                <Text
                    style={[styles.linkText, colorScheme === "dark" && styles.linkTextDark]}
                >
                    {label}
                </Text>
            </Pressable>
        </Link>
    );

    const handleSignOut = async () => {
        try {
            // Assuming you're still using Supabase for auth
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Sign out error:', error.message);
        }
    };

    return (
        <Animated.View
            style={[
                {
                    width: sidebarAnimatedWidth,
                    overflow: "hidden",
                    height: "100%",
                },
                colorScheme === "dark" ? styles.sidebarDark : styles.sidebarLight,
            ]}
        >
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Trena</Text>
                    <Text style={styles.subtitle}>Training Management App</Text>
                </View>
                <View style={styles.divider} />

                {/* Activity Selector Section */}
                <View style={styles.activitySection}>
                    <Text style={[styles.activityTitle, colorScheme === "dark" && styles.activityTitleDark]}>
                        Activity
                    </Text>

                    {isLoading ? (
                        <ActivityIndicator size="small" style={styles.loading} color="#3B82F6" />
                    ) : (
                        <Pressable
                            style={styles.activitySelector}
                            onPress={() => setActivityMenuVisible(true)}
                        >
                            <Text style={{
                                color: 'white',
                                backgroundColor: 'e5e7eb'
                            }}>
                                {selectedActivity?.activities?.name || 'Select Activity'}
                            </Text>
                            <Ionicons
                                name="chevron-down"
                                size={16}
                                color={colorScheme === "dark" ? "#d1d5db" : "#d1d5db"}
                            />
                        </Pressable>
                    )}
                </View>

                <View style={styles.divider} />

                <ScrollView style={styles.links}>
                    <NavLink href="/" iconName="home-outline" label="Home" />
                    <NavLink href="/logs" iconName="clipboard-outline" label="Log Exercise" />
                    <NavLink href="/history" iconName="time-outline" label="History" />
                    <NavLink href="/exercises" iconName="barbell-outline" label="Exercises" />
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        onPress={handleSignOut}
                        style={styles.signOutButton}
                    >
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </Pressable>
                </View>

                {/* Activity Selection Modal */}
                <Modal
                    visible={activityMenuVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setActivityMenuVisible(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setActivityMenuVisible(false)}
                    >
                        <View
                            style={[
                                styles.modalContent,
                                colorScheme === "dark" ? styles.modalContentDark : styles.modalContentLight
                            ]}
                        >
                            <Text style={[
                                styles.modalTitle,
                                colorScheme === "dark" && styles.modalTitleDark
                            ]}>
                                Select Activity
                            </Text>

                            <FlatList
                                data={activities}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.activityItem}
                                        onPress={() => {
                                            setSelectedActivity(item);
                                            setActivityMenuVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.activityItemText,
                                            colorScheme === "dark" && styles.activityItemTextDark,
                                            selectedActivity?.id === item.id && styles.selectedActivityText
                                        ]}>
                                            {item.activities.name}
                                        </Text>
                                        {selectedActivity?.id === item.id && (
                                            <Ionicons
                                                name="checkmark"
                                                size={18}
                                                color="#3B82F6"
                                            />
                                        )}
                                    </Pressable>
                                )}
                            />
                        </View>
                    </Pressable>
                </Modal>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    sidebarLight: {
        backgroundColor: "#ffffff",
        borderRightWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sidebarDark: {
        backgroundColor: "#111827",
        borderRightWidth: 1,
        borderColor: "#374151",
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    innerContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#3B82F6",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: "#e5e7eb",
    },
    divider: {
        borderBottomWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 16,
    },
    // Activity Section Styles
    activitySection: {
        marginBottom: 16,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: 8,
    },
    activityTitleDark: {
        color: "#9ca3af",
    },
    activitySelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: "rgb(31, 41, 55)",
    },
    activityText: {
        fontSize: 15,
        color: "#3B82F6",
        fontWeight: "500",
    },
    activityTextDark: {
        color: "#60a5fa",
    },
    loading: {
        marginTop: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContentLight: {
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
    },
    modalContentDark: {
        backgroundColor: "#1f2937",
        borderColor: "#374151",
    },
    modalContent: {
        width: "80%",
        maxHeight: "60%",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
        color: "#1f2937",
    },
    modalTitleDark: {
        color: "#f3f4f6",
    },
    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    activityItemText: {
        fontSize: 16,
        color: "#1f2937",
    },
    activityItemTextDark: {
        color: "#f3f4f6",
    },
    selectedActivityText: {
        color: "#3B82F6",
        fontWeight: "500",
    },
    // Original styles
    links: {
        flex: 1,
        marginVertical: 16,
    },
    navLink: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    icon: {
        marginRight: 12,
        color: "#1f2937",
    },
    iconDark: {
        color: "#d1d5db",
    },
    linkText: {
        fontSize: 16,
        color: "#1f2937",
    },
    linkTextDark: {
        color: "#d1d5db",
    },
    footer: {
        borderTopWidth: 1,
        borderColor: "#e5e7eb",
        paddingTop: 16,
    },
    signOutButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#ef4444",
        borderRadius: 8,
    },
    signOutText: {
        textAlign: "center",
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
});