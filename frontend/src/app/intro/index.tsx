// src/app/index.tsx
import { Link } from "expo-router";
import React from "react";
import { Text, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
  return (
    <View className="flex flex-1">
      <Header />
      <Content />
      <Footer />
    </View>
  );
}

function Content() {
  return (
    <View className="flex-1">
      <View className="py-12 md:py-24 lg:py-32">
        <View className="px-4 md:px-6">
          <View className="flex flex-col items-center gap-4 text-center">
            <Text
              role="heading"
              className="text-3xl text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Trena
            </Text>
            <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
              Track, optimize, and transform your fitness journey
            </Text>

            <View className="gap-4 flex-row">
              <Link
                suppressHighlighting
                className="flex h-9 items-center justify-center overflow-hidden rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white web:shadow ios:shadow transition-colors hover:bg-emerald-700 active:bg-emerald-800 web:focus-visible:outline-none web:focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50"
                href="/auth"
              >
                Get Started
              </Link>
              <Link
                suppressHighlighting
                className="flex h-9 items-center justify-center overflow-hidden rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 web:shadow ios:shadow transition-colors hover:bg-gray-100 active:bg-gray-200 web:focus-visible:outline-none web:focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-50 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-300"
                href="/"
              >
                Learn More
              </Link>
            </View>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View className="py-12 bg-gray-50 dark:bg-gray-800">
        <View className="px-4 md:px-6 max-w-6xl mx-auto">
          <Text className="text-2xl font-bold text-center mb-8">Your Complete Fitness Companion</Text>
          <Text className="text-gray-700 dark:text-gray-300 text-center mb-8">
            Trena is an open-source training app for tracking and optimizing workouts, nutrition, and progress.
            Whether you're just starting your fitness journey or are a seasoned athlete, Trena provides all the tools
            you need to reach your goals.
          </Text>

          {/* Features */}
          <View className="mt-12">
            <Text className="text-xl font-bold text-center mb-8">Features</Text>
            <View className="flex-row flex-wrap justify-center">
              <FeatureCard
                title="Cardio Tracking"
                description="Record runs, cycling, swimming and more with detailed metrics"
                icon="🏃‍♂️"
              />
              <FeatureCard
                title="Resistance Training"
                description="Log your sets, reps and weights with customizable exercises"
                icon="💪"
              />
              <FeatureCard
                title="Nutrition Logging"
                description="Track your meals, calories and macros to fuel your performance"
                icon="🥗"
              />
              <FeatureCard
                title="Progress Monitoring"
                description="Track body measurements and see your transformation over time"
                icon="📊"
              />
              <FeatureCard
                title="Stats & Insights"
                description="Visualize your progress with detailed charts and personalized analytics"
                icon="📈"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Status Section */}
      <View className="py-12">
        <View className="px-4 md:px-6 max-w-6xl mx-auto">
          <Text className="text-xl font-bold text-center mb-4">Development Status</Text>
          <Text className="text-gray-700 dark:text-gray-300 text-center">
            In active development – Contributions welcome!
          </Text>
        </View>
      </View>
    </View>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <View className="p-4 m-2 bg-white dark:bg-gray-900 rounded-lg shadow w-full max-w-xs">
      <Text className="text-3xl text-center mb-2">{icon}</Text>
      <Text className="font-bold text-lg text-center mb-2">{title}</Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center">{description}</Text>
    </View>
  );
}

function Header() {
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: top }}>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row justify-between">
        <Link className="font-bold flex-1 items-center justify-center" href="/">
          Trena
        </Link>
        <View className="flex flex-row gap-4 sm:gap-6">
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/"
          >
            Features
          </Link>
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/"
          >
            Community
          </Link>
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/"
          >
            About
          </Link>
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="/auth"
          >
            Login
          </Link>
        </View>
      </View>
    </View>
  );
}

function Footer() {
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      className="flex shrink-0 bg-gray-100 dark:bg-gray-800"
      style={{ paddingBottom: bottom }}
    >
      <View className="py-6 flex items-center justify-center px-4 md:px-6">
        <Text className="text-center text-gray-700 dark:text-gray-300">
          © {new Date().getFullYear()} Trena • Open Source
        </Text>
      </View>
    </View>
  );
}