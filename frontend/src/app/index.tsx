// src/app/plans.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Link, router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { createPlan, fetchPlans } from "../api/reqs";

interface Plan {
    id: string;
    name: string;
}

export default function PlansScreen() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [newPlanName, setNewPlanName] = useState("");
    const navigation = useNavigation<any>();
    const { top, bottom } = useSafeAreaInsets();

    useEffect(() => {
        handleFetchPlans();
    }, []);


    const handleFetchPlans = async () => {

        setLoading(true);
        try {
            const data = await fetchPlans();
            console.log('fetch plans', data)

            if (data && Array.isArray(data)) {
                setPlans(data);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        if (!newPlanName.trim()) return;

        try {
            const newPlan = await createPlan(newPlanName);
            setPlans([...plans, newPlan]);
            setNewPlanName("");
            setVisible(false);
        } catch (error) {
            console.error("Error creating plan:", error);
        }
    };

    const handlePlanPress = (plan: Plan) => {
        navigation.navigate("PlanDetail", { plan });
    };

    const renderItem = ({ item }: { item: Plan }) => (
        <TouchableOpacity
            className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            onPress={() => handlePlanPress(item)}
        >
            <Link href={`/plan?plan=${item.id}`} className="text-lg font-bold text-gray-900 dark:text-white">
                {item.name}
            </Link>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white dark:bg-gray-900"
            style={{ paddingTop: top, paddingBottom: bottom }}
        >
            {/* Header */}
            <View className="items-center justify-center py-6">
                <Text className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                    Trena
                </Text>
                <Text className="mt-2 text-gray-600 dark:text-gray-400">
                    Training Plans
                </Text>
            </View>

            {/* Content Container */}
            <View className="flex-1 px-4">
                {(
                    <>
                        {plans.length === 0 ? (
                            <View className="flex-1 items-center justify-center px-6">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    No plans found
                                </Text>
                                <Text className="text-center text-gray-600 dark:text-gray-400">
                                    Create your first training plan by clicking the + button
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={plans}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ padding: 8 }}
                            />
                        )}
                    </>
                )}
            </View>

            {/* FAB Button */}
            {(
                <TouchableOpacity
                    className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-600 dark:bg-emerald-500 rounded-full items-center justify-center shadow-lg"
                    onPress={() => setVisible(true)}
                >
                    <Text className="text-2xl text-white">+</Text>
                </TouchableOpacity>
            )}

            {/* Dialog Modal */}
            {visible && (
                <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center px-6">
                    <View className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm p-6">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Create New Plan
                        </Text>

                        <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Plan Name
                        </Text>
                        <TextInput
                            className="px-4 py-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                            placeholder="Enter plan name"
                            placeholderTextColor="#9CA3AF"
                            value={newPlanName}
                            onChangeText={setNewPlanName}
                        />

                        <View className="flex-row justify-end space-x-2">
                            <TouchableOpacity
                                className="py-2 px-4"
                                onPress={() => setVisible(false)}
                            >
                                <Text className="text-gray-600 dark:text-gray-400">
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`py-2 px-4 rounded-md ${!newPlanName.trim()
                                    ? "bg-emerald-300 dark:bg-emerald-800"
                                    : "bg-emerald-600 dark:bg-emerald-500"
                                    }`}
                                onPress={handleCreatePlan}
                                disabled={!newPlanName.trim()}
                            >
                                <Text className="font-medium text-white">
                                    Create
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Back Link */}
            <View className="mt-2 mb-4 items-center">
                <Link href="/" className="text-gray-500 dark:text-gray-400">
                    Back to Home
                </Link>
            </View>
        </KeyboardAvoidingView>
    );
}