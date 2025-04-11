import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { fetchLogs, fetchPlans, fetchExerciseGroupsByPlan, fetchExercises } from "../api/reqs";

export default function HistoryScreen() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [plans, setPlans] = useState([]);
    const [exerciseGroups, setExerciseGroups] = useState([]);
    const [exercises, setExercises] = useState([]);

    // Filter states
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { top, bottom } = useSafeAreaInsets();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [selectedPlan, selectedGroup, selectedExercise, searchTerm]);

    const loadData = async () => {
        setLoading(true);
        try {
            const plansData = await fetchPlans();
            setPlans(plansData || []);

            const groupsData = await Promise.all(
                plansData.map((plan) => fetchExerciseGroupsByPlan(plan.id))
            );
            setExerciseGroups(groupsData.flat() || []);

            const exercisesData = await fetchExercises();
            setExercises(exercisesData || []);

            const logsData = await fetchLogs();
            setLogs(logsData || []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...logs];

        if (selectedPlan) {
            filtered = filtered.filter((log) => log.plan_id === selectedPlan.id);
        }
        if (selectedGroup) {
            filtered = filtered.filter((log) => log.group_id === selectedGroup.id);
        }
        if (selectedExercise) {
            filtered = filtered.filter((log) => log.exercise_id === selectedExercise.id);
        }
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter((log) =>
                log.exercise?.name.toLowerCase().includes(lowerSearchTerm)
            );
        }

        setLogs(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const renderLogItem = ({ item }) => (
        <View className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {item.exercise?.name || "Unknown Exercise"}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {formatDate(item.created_at)}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
                {item.plan_name || "Unknown Plan"} • {item.group_name || "Unknown Group"}
            </Text>
            <View className="flex-row justify-around mt-2">
                <View className="items-center">
                    <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                        {item.metrics.sets || "-"}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Sets</Text>
                </View>
                <View className="items-center">
                    <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                        {item.metrics.reps || "-"}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Reps</Text>
                </View>
                <View className="items-center">
                    <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                        {item.metrics.weight ? `${item.metrics.weight} kg` : "-"}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Weight</Text>
                </View>
            </View>
            {item.metrics.notes && (
                <View className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <Text className="text-sm text-gray-700 dark:text-gray-300">
                        {item.metrics.notes}
                    </Text>
                </View>
            )}
        </View>
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
                    Exercise History
                </Text>
                <Text className="mt-2 text-gray-600 dark:text-gray-400">
                    View and filter your exercise logs
                </Text>
            </View>

            {/* Filters */}
            <View className="px-4">
                <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filter Logs
                </Text>
                <View className="flex-row space-x-2 mb-4">
                    <Dropdown
                        label="Select Plan"
                        items={plans}
                        selectedItem={selectedPlan}
                        onSelect={setSelectedPlan}
                    />
                    <Dropdown
                        label="Select Group"
                        items={exerciseGroups.filter((g) => g.plan_id === selectedPlan?.id)}
                        selectedItem={selectedGroup}
                        onSelect={setSelectedGroup}
                    />
                    <Dropdown
                        label="Select Exercise"
                        items={exercises}
                        selectedItem={selectedExercise}
                        onSelect={setSelectedExercise}
                    />
                </View>
                <TextInput
                    className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="Search by exercise name"
                    placeholderTextColor="#9CA3AF"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            {/* Logs List */}
            <View className="flex-1 px-4 mt-4">
                {loading ? (
                    <ActivityIndicator size="large" color="#10b981" />
                ) : logs.length === 0 ? (
                    <View className="py-8 items-center">
                        <Text className="text-gray-500 dark:text-gray-400">
                            No logs found.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={logs}
                        renderItem={renderLogItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Back Link */}
            <View className="mt-4 mb-6 items-center">
                <Link href="/" className="text-gray-500 dark:text-gray-400">
                    Back to Home
                </Link>
            </View>
        </KeyboardAvoidingView>
    );
}

const Dropdown = ({ label, items, selectedItem, onSelect }) => (
    <View className="flex-1">
        <TouchableOpacity
            className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 flex-row justify-between items-center"
            onPress={() => onSelect(selectedItem ? null : items[0] || null)}
        >
            <Text className={`${selectedItem ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                {selectedItem ? selectedItem.name : label}
            </Text>
            <Text>{selectedItem ? "\u25B2" : "\u25BC"}</Text>
        </TouchableOpacity>
        {selectedItem && (
            <View className="border border-gray-300 dark:border-gray-700 rounded-md mt-1 max-h-40 bg-white dark:bg-gray-800">
                <ScrollView>
                    {items.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="py-3 px-4 border-b border-gray-200 dark:border-gray-700"
                            onPress={() => onSelect(item)}
                        >
                            <Text className="text-black dark:text-white">{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )}
    </View>
);