// src/app/exercises.tsx
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
import { Link, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { createExercise, fetchAllExercises } from "../api/reqs";

interface Exercise {
    id: string;
    name: string;
    description: string;
}

export default function ExercisesScreen() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newExerciseName, setNewExerciseName] = useState("");
    const [newExerciseDescription, setNewExerciseDescription] = useState("");
    const { selectedActivity } = useAppContext();
    const navigation = useNavigation<any>();
    const { top, bottom } = useSafeAreaInsets();

    useEffect(() => {
        if (selectedActivity) {
            fetchExercises();
        }
    }, [selectedActivity]);

    useEffect(() => {
        filterExercises();
    }, [exercises, searchQuery]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const data = await fetchAllExercises();

            if (data && Array.isArray(data)) {
                setExercises(data);
                setFilteredExercises(data);
            }
        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterExercises = () => {
        let filtered = [...exercises];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(exercise =>
                exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (exercise.description && exercise.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        setFilteredExercises(filtered);
    };

    const handleCreateExercise = async () => {
        if (!newExerciseName.trim()) return;

        try {
            const newExercise = await createExercise(newExerciseName, newExerciseDescription);
            setExercises([...exercises, newExercise]);
            resetForm();
        } catch (error) {
            console.error("Error creating exercise:", error);
        }
    };

    const resetForm = () => {
        setNewExerciseName("");
        setNewExerciseDescription("");
        setVisible(false);
    };

    const handleExercisePress = (exercise: Exercise) => {
        navigation.navigate("ExerciseDetail", { exercise });
    };

    const renderItem = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            onPress={() => handleExercisePress(item)}
        >
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {item.name}
            </Text>
            {item.description ? (
                <Text className="mt-2 text-gray-600 dark:text-gray-400">
                    {item.description}
                </Text>
            ) : null}
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
                    Exercises Library
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
                ) : loading && exercises.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#10b981" />
                    </View>
                ) : (
                    <>
                        {/* Search Bar */}
                        <View className="mb-4">
                            <TextInput
                                className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg"
                                placeholder="Search exercises"
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {filteredExercises.length === 0 ? (
                            <View className="flex-1 items-center justify-center px-6">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    No exercises found
                                </Text>
                                <Text className="text-center text-gray-600 dark:text-gray-400">
                                    {exercises.length === 0
                                        ? "Create your first exercise by clicking the + button"
                                        : "Try adjusting your search"}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredExercises}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ padding: 8 }}
                            />
                        )}
                    </>
                )}
            </View>

            {/* FAB Button */}
            {selectedActivity && (
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
                            Create New Exercise
                        </Text>

                        <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Exercise Name
                        </Text>
                        <TextInput
                            className="px-4 py-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                            placeholder="Enter exercise name"
                            placeholderTextColor="#9CA3AF"
                            value={newExerciseName}
                            onChangeText={setNewExerciseName}
                        />

                        <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description (optional)
                        </Text>
                        <TextInput
                            className="px-4 py-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                            placeholder="Enter description"
                            placeholderTextColor="#9CA3AF"
                            value={newExerciseDescription}
                            onChangeText={setNewExerciseDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

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
                                className={`py-2 px-4 rounded-md ${!newExerciseName.trim()
                                    ? "bg-emerald-300 dark:bg-emerald-800"
                                    : "bg-emerald-600 dark:bg-emerald-500"
                                    }`}
                                onPress={handleCreateExercise}
                                disabled={!newExerciseName.trim()}
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