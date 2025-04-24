import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import Toast from "react-native-toast-message";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterScreen = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const showSuccessToast = () => {
    Toast.show({
      type: "success",
      text1: "Account created!",
      text2: "Welcome to our book community 📚",
      position: "bottom",
      visibilityTime: 3000,
    });
  };

  const showErrorToast = (message: string) => {
    Toast.show({
      type: "error",
      text1: "Registration failed",
      text2: message,
      position: "bottom",
      visibilityTime: 4000,
    });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await register(data.name, data.email, data.password);
      showSuccessToast();
      setTimeout(() => router.back(), 1500); // Wait for toast to show before navigating
    } catch (err) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      showErrorToast(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-black"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-16 pb-8">
            {/* Header with animation */}
            <Animated.View entering={FadeIn.duration(500)} className="mb-8">
              <View className="flex-row items-center mb-2">
                <Text className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  📚 Join aisBooks
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400">
                Create an account to start your reading journey
              </Text>
            </Animated.View>

            {/* Form fields with animations */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              className="mb-4"
            >
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-gray-800 border ${
                  errors.name
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-xl px-4`}
              >
                <Feather
                  name="user"
                  size={20}
                  color={
                    errors.name ? "#ef4444" : isDarkMode ? "#9ca3af" : "#6b7280"
                  }
                  className="mr-3"
                />
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`flex-1 py-3 text-gray-900 dark:text-white ${
                        errors.name ? "placeholder-red-400" : ""
                      }`}
                      placeholder="Your fullname here"
                      placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="name"
                  defaultValue=""
                />
              </View>
              {errors.name && (
                <Text className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">
                  {errors.name.message}
                </Text>
              )}
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="mb-4"
            >
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-gray-800 border ${
                  errors.email
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-xl px-4`}
              >
                <Feather
                  name="mail"
                  size={20}
                  color={
                    errors.email
                      ? "#ef4444"
                      : isDarkMode
                      ? "#9ca3af"
                      : "#6b7280"
                  }
                  className="mr-3"
                />
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`flex-1 py-3 text-gray-900 dark:text-white ${
                        errors.email ? "placeholder-red-400" : ""
                      }`}
                      placeholder="example@example.com"
                      placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="email"
                  defaultValue=""
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">
                  {errors.email.message}
                </Text>
              )}
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              className="mb-6"
            >
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </Text>
              <View
                className={`flex-row items-center bg-white dark:bg-gray-800 border ${
                  errors.password
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-xl px-4`}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={
                    errors.password
                      ? "#ef4444"
                      : isDarkMode
                      ? "#9ca3af"
                      : "#6b7280"
                  }
                  className="mr-3"
                />
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`flex-1 py-3 text-gray-900 dark:text-white ${
                        errors.password ? "placeholder-red-400" : ""
                      }`}
                      placeholder="••••••"
                      placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                      secureTextEntry={secureTextEntry}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="password"
                  defaultValue=""
                />
                <TouchableOpacity onPress={toggleSecureEntry}>
                  <Feather
                    name={secureTextEntry ? "eye-off" : "eye"}
                    size={20}
                    color={isDarkMode ? "#9ca3af" : "#6b7280"}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">
                  {errors.password.message}
                </Text>
              )}
            </Animated.View>

            {/* Submit button with animation */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <TouchableOpacity
                className={`py-4 rounded-xl flex-row justify-center items-center ${
                  loading
                    ? "bg-blue-400 dark:bg-blue-600"
                    : "bg-blue-600 dark:bg-blue-700"
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <>
                    <ActivityIndicator
                      color="white"
                      size="small"
                      className="mr-2"
                    />
                    <Text className="text-white font-semibold">
                      Creating Account...
                    </Text>
                  </>
                ) : (
                  <>
                    <Feather
                      name="user-plus"
                      size={20}
                      color="white"
                      className="mr-2"
                    />
                    <Text className="text-white font-semibold">
                      Create Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(500)}
              className="flex-row items-center my-6"
            >
              <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <Text className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
                OR
              </Text>
              <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </Animated.View>

            {/* Login link */}
            <Animated.View
              entering={FadeInDown.delay(600).duration(500)}
              className="flex-row justify-center"
            >
              <Text className="text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast component */}
      <Toast
        config={{
          success: (props) => (
            <View className="bg-green-500 dark:bg-green-700 p-4 rounded-lg mx-4 mb-4 flex-row items-start">
              <MaterialIcons
                name="check-circle"
                size={24}
                color="white"
                className="mr-3"
              />
              <View className="flex-1">
                <Text className="text-white font-semibold">{props.text1}</Text>
                <Text className="text-white opacity-90">{props.text2}</Text>
              </View>
            </View>
          ),
          error: (props) => (
            <View className="bg-red-500 dark:bg-red-700 p-4 rounded-lg mx-4 mb-4 flex-row items-start">
              <MaterialIcons
                name="error-outline"
                size={24}
                color="white"
                className="mr-3"
              />
              <View className="flex-1">
                <Text className="text-white font-semibold">{props.text1}</Text>
                <Text className="text-white opacity-90">{props.text2}</Text>
              </View>
            </View>
          ),
        }}
      />
    </>
  );
};

export default RegisterScreen;
