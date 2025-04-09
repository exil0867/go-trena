// src/app/auth.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const { top, bottom } = useSafeAreaInsets();

    async function handleAuthentication() {
        setLoading(true);
        setError("");

        try {
            // This is where you would integrate with Supabase
            // For now, we'll just simulate the authentication flow
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (isLogin) {
                // Sign in logic would go here
                console.log("Signing in with:", email, password);
                // If successful:
                router.replace("/");
            } else {
                // Sign up logic would go here
                console.log("Signing up with:", email, password);
                setError("Please check your email for verification link.");
            }
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white dark:bg-gray-900"
            style={{ paddingTop: top, paddingBottom: bottom }}
        >
            {/* Logo & App Name */}
            <View className="items-center justify-center py-12">
                <Text className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                    Trena
                </Text>
                <Text className="mt-2 text-gray-600 dark:text-gray-400">
                    Training Management App
                </Text>
            </View>

            {/* Form Container */}
            <View className="px-6 pt-8 pb-6 mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                {/* Email Input */}
                <View className="mb-4">
                    <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </Text>
                    <TextInput
                        className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                        placeholder="your.email@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                {/* Password Input */}
                <View className="mb-4">
                    <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </Text>
                    <TextInput
                        className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                {/* Error Message */}
                {error ? (
                    <Text className="mb-4 text-red-500 dark:text-red-400">
                        {error}
                    </Text>
                ) : null}

                {/* Submit Button */}
                <TouchableOpacity
                    className={`py-3 rounded-md flex items-center justify-center ${(!email || !password || loading)
                        ? "bg-emerald-300 dark:bg-emerald-800"
                        : "bg-emerald-600 dark:bg-emerald-500"
                        }`}
                    onPress={handleAuthentication}
                    disabled={!email || !password || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text className="font-medium text-white">
                            {isLogin ? "Sign In" : "Sign Up"}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Toggle Login/Signup */}
                <TouchableOpacity
                    className="mt-4 py-2"
                    onPress={() => setIsLogin(!isLogin)}
                >
                    <Text className="text-center text-emerald-600 dark:text-emerald-500">
                        {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Back to Home Link */}
            <View className="mt-8 items-center">
                <Link href="/" className="text-gray-500 dark:text-gray-400">
                    Back to Home
                </Link>
            </View>
        </KeyboardAvoidingView>
    );
}