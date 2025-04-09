// src/app/logs.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { Link, useNavigation, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { fetchPlansById, fetchExerciseGroupsByPlan, fetchExercisesByGroup, logExercise, fetchRecentLogs } from "../api/reqs";

interface Plan {
    id: string;
    name: string;
    activity_id: string;
}

interface ExerciseGroup {
    id: string;
    name: string;
    plan_id: string;
    day_of_week: number;
}

interface Exercise {
    id: string;
    name: string;
    description?: string;
}

interface ExerciseLog {
    id: string;
    exercise_id: string;
    sets: number;
    reps: number;
    weight: number | null;
    notes: string | null;
    created_at: string;
}

export default function LogsScreen() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [exerciseGroups, setExerciseGroups] = useState<ExerciseGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<ExerciseGroup | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [logs, setLogs] = useState<ExerciseLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    // Form state
    const [dialogVisible, setDialogVisible] = useState(false);
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');

    // Dropdown states
    const [planMenuVisible, setPlanMenuVisible] = useState(false);
    const [groupMenuVisible, setGroupMenuVisible] = useState(false);

    const { selectedActivity } = useAppContext();
    const navigation = useNavigation<any>();
    const { top, bottom } = useSafeAreaInsets();

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    useEffect(() => {
        if (selectedActivity) {
            fetchPlans();
            fetchRecentLogsData(); // Fetch recent logs on initial load
        }
    }, [selectedActivity]);

    useEffect(() => {
        if (selectedPlan) {
            fetchGroups();
        }
    }, [selectedPlan]);

    useEffect(() => {
        if (selectedGroup) {
            fetchExercises();
        }
    }, [selectedGroup]);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await fetchPlansById(selectedActivity.id);
            if (data && Array.isArray(data)) {
                setPlans(data);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        if (!selectedPlan) return;

        setLoading(true);
        try {
            const data = await fetchExerciseGroupsByPlan(selectedPlan.id);
            if (data && Array.isArray(data)) {
                setExerciseGroups(data);
                setSelectedGroup(null); // Reset selected group when plan changes
                setExercises([]); // Clear exercises
            }
        } catch (error) {
            console.error("Error fetching exercise groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExercises = async () => {
        if (!selectedGroup) return;

        setLoading(true);
        try {
            const data = await fetchExercisesByGroup(selectedGroup.id);
            if (data && data.exercises) {
                setExercises(data.exercises);
            }
        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentLogsData = async () => {
        setLoading(true);
        try {
            // Modify the fetchRecentLogs function to get only the last 10 logs
            const data = await fetchRecentLogs(10); // Limit to 10 logs
            if (data && Array.isArray(data)) {
                setLogs(data);
            }
        } catch (error) {
            console.error("Error fetching recent logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogExercise = async () => {
        if (!selectedExercise || !sets || !reps) return;

        try {
            const newLog = await logExercise(
                selectedExercise.id,
                sets,
                reps,
                weight,
                notes
            );

            // Add the new log to the logs state
            setLogs([newLog, ...logs.slice(0, 9)]); // Keep only 10 most recent logs
            resetForm();
        } catch (error) {
            console.error("Error logging exercise:", error);
        }
    };

    const resetForm = () => {
        setSets('');
        setReps('');
        setWeight('');
        setNotes('');
        setDialogVisible(false);
    };

    const navigateToHistory = () => {
        router.push("/history");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDayName = (dayIndex: number) => {
        return weekdays[dayIndex] || "Unknown";
    };

    const renderExerciseCard = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            onPress={() => {
                setSelectedExercise(item);
                setDialogVisible(true);
            }}
        >
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {item.name}
            </Text>
            {item.description && (
                <Text className="mt-2 text-gray-600 dark:text-gray-400">
                    {item.description}
                </Text>
            )}
            <TouchableOpacity
                className="mt-3 py-2 flex-row justify-center items-center bg-emerald-600 dark:bg-emerald-500 rounded-md"
            >
                <Text className="text-white font-medium">Log Exercise</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderLogItem = ({ item }: { item: ExerciseLog }) => {
        // Find the exercise name
        const exercise = exercises.find((ex) => ex.id === item.exercise_id);

        return (
            <View className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    {exercise?.name || "Unknown Exercise"}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {formatDate(item.created_at)}
                </Text>
                <View className="flex-row justify-around mt-2">
                    <View className="items-center">
                        <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                            {item.sets || "-"}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Sets</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                            {item.reps || "-"}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Reps</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                            {item.weight ? `${item.weight} kg` : "-"}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Weight</Text>
                    </View>
                </View>
                {item.notes && (
                    <View className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <Text className="text-sm text-gray-700 dark:text-gray-300">
                            {item.notes}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

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
                    Exercise Logs
                </Text>
            </View>

            {/* Content Container */}
            <View className="flex-1 px-4">
                {!selectedActivity ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-center text-gray-600 dark:text-gray-400">
                            Please select an activity from the drawer menu
                        </Text>
                    </View>
                ) : loading && plans.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#10b981" />
                    </View>
                ) : (
                    <ScrollView className="flex-1">
                        {/* Plan Selection */}
                        <View className="mb-6">
                            <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                1. Select Plan
                            </Text>
                            <TouchableOpacity
                                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 flex-row justify-between items-center"
                                onPress={() => setPlanMenuVisible(!planMenuVisible)}
                            >
                                <Text className={`${selectedPlan ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                                    {selectedPlan ? selectedPlan.name : "Select a training plan"}
                                </Text>
                                <Text>{planMenuVisible ? "\u25B2" : "\u25BC"}</Text>
                            </TouchableOpacity>

                            {planMenuVisible && plans.length > 0 && (
                                <View className="border border-gray-300 dark:border-gray-700 rounded-md mt-1 max-h-40 bg-white dark:bg-gray-800">
                                    <ScrollView>
                                        {plans.map((plan) => (
                                            <TouchableOpacity
                                                key={plan.id}
                                                className="py-3 px-4 border-b border-gray-200 dark:border-gray-700"
                                                onPress={() => {
                                                    setSelectedPlan(plan);
                                                    setPlanMenuVisible(false);
                                                }}
                                            >
                                                <Text className="text-black dark:text-white">
                                                    {plan.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Group Selection (only visible if plan is selected) */}
                        {selectedPlan && (
                            <View className="mb-6">
                                <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    2. Select Exercise Group
                                </Text>
                                <TouchableOpacity
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 flex-row justify-between items-center"
                                    onPress={() => setGroupMenuVisible(!groupMenuVisible)}
                                >
                                    <Text className={`${selectedGroup ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                                        {selectedGroup
                                            ? `${selectedGroup.name} (${getDayName(selectedGroup.day_of_week)})`
                                            : "Select an exercise group"}
                                    </Text>
                                    <Text>{groupMenuVisible ? "\u25B2" : "\u25BC"}</Text>
                                </TouchableOpacity>

                                {groupMenuVisible && exerciseGroups.length > 0 && (
                                    <View className="border border-gray-300 dark:border-gray-700 rounded-md mt-1 max-h-40 bg-white dark:bg-gray-800">
                                        <ScrollView>
                                            {exerciseGroups.map((group) => (
                                                <TouchableOpacity
                                                    key={group.id}
                                                    className="py-3 px-4 border-b border-gray-200 dark:border-gray-700"
                                                    onPress={() => {
                                                        setSelectedGroup(group);
                                                        setGroupMenuVisible(false);
                                                    }}
                                                >
                                                    <Text className="text-black dark:text-white">
                                                        {group.name} ({getDayName(group.day_of_week)})
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Exercises List (only visible if group is selected) */}
                        {selectedGroup && (
                            <View className="mb-6">
                                <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    3. Select an exercise to log
                                </Text>

                                {exercises.length === 0 ? (
                                    <View className="py-8 items-center">
                                        <Text className="text-gray-500 dark:text-gray-400">
                                            No exercises found in this group
                                        </Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={exercises}
                                        renderItem={renderExerciseCard}
                                        keyExtractor={(item) => item.id}
                                        scrollEnabled={false}
                                    />
                                )}
                            </View>
                        )}

                        {/* Recent Logs Section */}
                        {logs.length > 0 && (
                            <View className="mt-6 mb-6">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                        Recent Exercise Logs
                                    </Text>
                                    <TouchableOpacity
                                        className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 rounded-md"
                                        onPress={navigateToHistory}
                                    >
                                        <Text className="text-emerald-600 dark:text-emerald-300 font-medium">
                                            See History
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={logs}
                                    renderItem={renderLogItem}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                />
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>

            {/* Add Log Dialog */}
            {dialogVisible && (
                <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center px-6">
                    <View className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm p-6">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Log Exercise
                        </Text>
                        <Text className="mb-4 text-gray-600 dark:text-gray-400">
                            {selectedExercise?.name}
                        </Text>

                        <View className="flex-row space-x-2 mb-4">
                            <View className="flex-1">
                                <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sets
                                </Text>
                                <TextInput
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                                    placeholder="Sets"
                                    placeholderTextColor="#9CA3AF"
                                    value={sets}
                                    onChangeText={setSets}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View className="flex-1">
                                <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Reps
                                </Text>
                                <TextInput
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                                    placeholder="Reps"
                                    placeholderTextColor="#9CA3AF"
                                    value={reps}
                                    onChangeText={setReps}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View className="flex-1">
                                <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Weight (kg)
                                </Text>
                                <TextInput
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                                    placeholder="Weight"
                                    placeholderTextColor="#9CA3AF"
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notes (optional)
                            </Text>
                            <TextInput
                                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                                placeholder="Add notes here"
                                placeholderTextColor="#9CA3AF"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <View className="flex-row justify-end space-x-2">
                            <TouchableOpacity
                                className="py-2 px-4"
                                onPress={resetForm}
                            >
                                <Text className="text-gray-600 dark:text-gray-400">
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`py-2 px-4 rounded-md ${!sets || !reps
                                    ? "bg-emerald-300 dark:bg-emerald-800"
                                    : "bg-emerald-600 dark:bg-emerald-500"
                                    }`}
                                onPress={handleLogExercise}
                                disabled={!sets || !reps}
                            >
                                <Text className="font-medium text-white">
                                    Log Exercise
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