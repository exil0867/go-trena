// src/app/plan-details.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ScrollView,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    createExerciseGroup,
    fetchExerciseGroupsByPlan,
    fetchExercisesByGroup,
    fetchAllExercises,
    addExerciseToGroup,
    FetchExercisesByGroupResponse,
    Exercise,
    fetchPlans
} from "../../api/reqs";
import { useAppContext } from "@/context/AppContext";

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

// Define a day item structure for FlatList
interface DayItem {
    dayIndex: number;
    dayName: string;
}

export default function PlanDetailScreen() {
    const params = useLocalSearchParams<{ plan: string }>();
    const [plan, setPlan] = useState<Plan | null>(null)

    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<ExerciseGroup[]>([]);
    const [exercises, setExercises] = useState<Record<string, FetchExercisesByGroupResponse['exercises']>>({});
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    // Group dialog state
    const [groupDialogVisible, setGroupDialogVisible] = useState(false);
    const [currentDay, setCurrentDay] = useState<number | null>(null);
    const [newGroupName, setNewGroupName] = useState("");

    // Exercise dialog state
    const [exerciseDialogVisible, setExerciseDialogVisible] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
    const [exerciseMenuVisible, setExerciseMenuVisible] = useState(false);

    const { top, bottom } = useSafeAreaInsets();

    const weekdays = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];

    // Create data for FlatList
    const dayItems: DayItem[] = weekdays.map((dayName, dayIndex) => ({
        dayIndex,
        dayName
    }));

    useEffect(() => {
        const fetchData = async () => {
            if (params.plan) {
                const plans = await fetchPlans();
                const plan = plans.find((p) => p.id === params.plan)
                setPlan(plan)
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (plan) {
            fetchExerciseGroups();
            fetchAvailableExercises();
        }
    }, [plan]);

    const fetchExerciseGroups = async () => {
        setLoading(true);
        try {
            const data = await fetchExerciseGroupsByPlan(plan.id);

            if (data && Array.isArray(data)) {
                setGroups(data);
            }
        } catch (error) {
            console.error("Error fetching exercise groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableExercises = async () => {
        try {
            const data = await fetchAllExercises();

            if (data && Array.isArray(data)) {
                setAllExercises(data);
            }
        } catch (error) {
            console.error("Error fetching all exercises:", error);
        }
    };

    const fetchExercisesForGroup = async (groupId: string) => {
        try {
            const data = await fetchExercisesByGroup(groupId);

            if (data) {
                setExercises(prev => ({
                    ...prev,
                    [groupId]: data.exercises
                }));
            }
        } catch (error) {
            console.error("Error fetching exercises for group:", error);
        }
    };

    const handleAddGroup = async () => {
        if (currentDay === null || !newGroupName.trim()) return;

        try {
            const newGroup = await createExerciseGroup(plan.id, currentDay, newGroupName);
            setGroups((prev) => [...prev, newGroup[0]]);
            setNewGroupName("");
            setGroupDialogVisible(false);
        } catch (error) {
            console.error("Error creating exercise group:", error);
        }
    };

    const handleAddExerciseToGroup = async () => {
        if (!currentGroupId || !selectedExerciseId) return;

        try {
            // Call the API to persist the addition
            const result = await addExerciseToGroup(currentGroupId, selectedExerciseId);

            // Update local state based on the API response
            setExercises(prev => {
                const currentExercises = prev[currentGroupId] || [];
                return {
                    ...prev,
                    [currentGroupId]: [...currentExercises, result.exercise],
                };
            });

            resetExerciseForm();
        } catch (error) {
            console.error("Error adding exercise to group:", error);
        }
    };

    const showAddGroupDialog = (dayIndex: number) => {
        setCurrentDay(dayIndex);
        setGroupDialogVisible(true);
    };

    const showAddExerciseDialog = (groupId: string) => {
        setCurrentGroupId(groupId);
        setExerciseDialogVisible(true);
    };

    const resetExerciseForm = () => {
        setSelectedExerciseId(null);
        setExerciseDialogVisible(false);
    };

    const getGroupsForDay = (dayIndex: number) => {
        return groups.filter(group => group.day_of_week === dayIndex);
    };

    const toggleGroupExpansion = (groupId: string) => {
        if (expandedGroup === groupId) {
            setExpandedGroup(null);
        } else {
            setExpandedGroup(groupId);
            // Fetch exercises for this group if not already loaded
            if (!exercises[groupId]) {
                fetchExercisesForGroup(groupId);
            }
        }
    };

    const getExerciseName = (exerciseId: string | null) => {
        if (!exerciseId) return "Select Exercise";
        const exercise = allExercises.find(ex => ex.id === exerciseId);
        return exercise ? exercise.name : "Select Exercise";
    };

    const navigateToExerciseDetail = (exercise: Exercise) => {
        // This would navigate to an exercise detail screen
        console.log("Navigate to exercise detail:", exercise);
        // router.push({pathname: "/exercise-detail", params: { exercise: JSON.stringify(exercise) }});
    };

    // Render each day item
    const renderDayItem = ({ item }: { item: DayItem }) => {
        const dayGroups = getGroupsForDay(item.dayIndex);

        return (
            <View className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Day Header */}
                <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                        {item.dayName}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                        {dayGroups.length} exercise group{dayGroups.length !== 1 ? "s" : ""}
                    </Text>
                </View>

                {/* Day Content */}
                <View className="p-4">
                    {dayGroups.length === 0 ? (
                        <Text className="text-center text-gray-600 dark:text-gray-400 italic py-4">
                            No exercise groups
                        </Text>
                    ) : (
                        dayGroups.map((group) => (
                            <View key={group.id} className="mb-3">
                                {/* Group Accordion Header */}
                                <TouchableOpacity
                                    className="flex-row items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                                    onPress={() => toggleGroupExpansion(group.id)}
                                >
                                    <View className="flex-row items-center">
                                        <View className="w-6 h-6 mr-2 justify-center items-center bg-emerald-500 rounded-full">
                                            <Text className="text-white text-xs">
                                                {"\u2713"}
                                            </Text>
                                        </View>
                                        <Text className="font-medium text-gray-900 dark:text-white">
                                            {group.name}
                                        </Text>
                                    </View>
                                    <Text className="text-emerald-600 dark:text-emerald-500">
                                        {expandedGroup === group.id ? "\u25B2" : "\u25BC"}
                                    </Text>
                                </TouchableOpacity>

                                {/* Expanded Group Content */}
                                {expandedGroup === group.id && (
                                    <View className="mt-2 pl-8 pr-2">
                                        {exercises[group.id] ? (
                                            exercises[group.id].length > 0 ? (
                                                exercises[group.id].map((exercise, i) => (
                                                    <TouchableOpacity
                                                        key={i}
                                                        className="py-3 border-b border-gray-200 dark:border-gray-700"
                                                        onPress={() => navigateToExerciseDetail(exercise)}
                                                    >
                                                        <Text className="font-medium text-gray-900 dark:text-white">
                                                            {exercise.name}
                                                        </Text>
                                                        {exercise.description && (
                                                            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {exercise.description}
                                                            </Text>
                                                        )}
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <View className="py-4">
                                                    <Text className="text-gray-600 dark:text-gray-400">
                                                        No exercises in this group
                                                    </Text>
                                                </View>
                                            )
                                        ) : (
                                            <View className="py-4 items-center">
                                                <ActivityIndicator size="small" color="#10b981" />
                                                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                    Loading exercises...
                                                </Text>
                                            </View>
                                        )}

                                        {/* Add Exercise Button */}
                                        <TouchableOpacity
                                            className="mt-3 py-2 px-4 border border-emerald-600 dark:border-emerald-500 rounded-md items-center"
                                            onPress={() => showAddExerciseDialog(group.id)}
                                        >
                                            <Text className="text-emerald-600 dark:text-emerald-500">
                                                + Add Exercise
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    )}

                    {/* Add Group Button */}
                    <TouchableOpacity
                        className="mt-3 py-2 px-4 border border-emerald-600 dark:border-emerald-500 rounded-md items-center"
                        onPress={() => showAddGroupDialog(item.dayIndex)}
                    >
                        <Text className="text-emerald-600 dark:text-emerald-500">
                            + Add Exercise Group
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (!plan) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 bg-white dark:bg-gray-900"
                style={{ paddingTop: top, paddingBottom: bottom }}
            >
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-center text-gray-600 dark:text-gray-400">
                        Plan details not available
                    </Text>

                    <View className="mt-8">
                        <Link href="/plans" className="text-emerald-600 dark:text-emerald-500">
                            Back to Plans
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white dark:bg-gray-900"
            style={{ paddingTop: top, paddingBottom: bottom }}
        >
            {/* Header */}
            <View className="items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                    {plan.name}
                </Text>
                <Text className="mt-1 text-gray-600 dark:text-gray-400">
                    Training Plan
                </Text>
            </View>

            {/* Main Content */}
            {loading && groups.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <ScrollView className="flex-1">
                    <View className="p-4">
                        <FlatList
                            data={dayItems}
                            renderItem={renderDayItem}
                            keyExtractor={(item) => `day-${item.dayIndex}`}
                            scrollEnabled={false} // Disable scroll inside FlatList to avoid nested scrolling issues
                        />
                    </View>
                </ScrollView>
            )}

            {/* Group Dialog Modal */}
            {groupDialogVisible && (
                <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center px-6">
                    <View className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm p-6">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Add Exercise Group
                        </Text>
                        <Text className="mb-4 text-gray-600 dark:text-gray-400">
                            {currentDay !== null ? `Day: ${weekdays[currentDay]}` : ""}
                        </Text>

                        <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Group Name
                        </Text>
                        <TextInput
                            className="px-4 py-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                            placeholder="Enter group name"
                            placeholderTextColor="#9CA3AF"
                            value={newGroupName}
                            onChangeText={setNewGroupName}
                        />

                        <View className="flex-row justify-end space-x-2">
                            <TouchableOpacity
                                className="py-2 px-4"
                                onPress={() => setGroupDialogVisible(false)}
                            >
                                <Text className="text-gray-600 dark:text-gray-400">
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`py-2 px-4 rounded-md ${!newGroupName.trim()
                                    ? "bg-emerald-300 dark:bg-emerald-800"
                                    : "bg-emerald-600 dark:bg-emerald-500"
                                    }`}
                                onPress={handleAddGroup}
                                disabled={!newGroupName.trim()}
                            >
                                <Text className="font-medium text-white">
                                    Create
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Exercise Dialog Modal */}
            {exerciseDialogVisible && (
                <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center px-6">
                    <View className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm p-6">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Add Exercise to Group
                        </Text>
                        <Text className="mb-4 text-gray-600 dark:text-gray-400">
                            Select an exercise to add to this group
                        </Text>

                        <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Exercise
                        </Text>

                        {/* Custom Dropdown */}
                        <View className="mb-4">
                            <TouchableOpacity
                                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 flex-row justify-between items-center"
                                onPress={() => setExerciseMenuVisible(!exerciseMenuVisible)}
                            >
                                <Text className={`${selectedExerciseId ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                                    {getExerciseName(selectedExerciseId)}
                                </Text>
                                <Text>{exerciseMenuVisible ? "\u25B2" : "\u25BC"}</Text>
                            </TouchableOpacity>

                            {exerciseMenuVisible && (
                                <View className="border border-gray-300 dark:border-gray-700 rounded-md mt-1 max-h-40 bg-white dark:bg-gray-900">
                                    <ScrollView>
                                        {allExercises.length === 0 ? (
                                            <View className="py-2 px-4">
                                                <Text className="text-gray-600 dark:text-gray-400">
                                                    No exercises available
                                                </Text>
                                            </View>
                                        ) : (
                                            allExercises.map((exercise) => (
                                                <TouchableOpacity
                                                    key={exercise.id}
                                                    className="py-2 px-4 border-b border-gray-200 dark:border-gray-700"
                                                    onPress={() => {
                                                        setSelectedExerciseId(exercise.id);
                                                        setExerciseMenuVisible(false);
                                                    }}
                                                >
                                                    <Text className="text-black dark:text-white">
                                                        {exercise.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        <View className="flex-row justify-end space-x-2">
                            <TouchableOpacity
                                className="py-2 px-4"
                                onPress={resetExerciseForm}
                            >
                                <Text className="text-gray-600 dark:text-gray-400">
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`py-2 px-4 rounded-md ${!selectedExerciseId
                                    ? "bg-emerald-300 dark:bg-emerald-800"
                                    : "bg-emerald-600 dark:bg-emerald-500"
                                    }`}
                                onPress={handleAddExerciseToGroup}
                                disabled={!selectedExerciseId}
                            >
                                <Text className="font-medium text-white">
                                    Add Exercise
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Back Link */}
            <View className="mt-2 mb-4 items-center">
                <Link href="/plans" className="text-gray-500 dark:text-gray-400">
                    Back to Plans
                </Link>
            </View>
        </KeyboardAvoidingView>
    );
}