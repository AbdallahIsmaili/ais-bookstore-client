import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen = () => {
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const showSuccessToast = () => {
    Toast.show({
      type: "success",
      text1: "Login successful!",
      text2: "Welcome back to your reading journey 📚",
      position: "bottom",
      visibilityTime: 3000,
    });
  };

  const showErrorToast = (message: string) => {
    Toast.show({
      type: "error",
      text1: "Login failed",
      text2: message,
      position: "bottom",
      visibilityTime: 4000,
    });
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      showSuccessToast();
      setTimeout(() => router.replace("/(tabs)"), 1500);
    } catch (err) {
      const errorMessage =
        err.message || "Login failed. Please check your credentials.";
      showErrorToast(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-black"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-24 pb-8">
          {/* Header with animation */}
          <Animated.View entering={FadeIn.duration(500)} className="mb-8">
            <View className="flex-row items-center mb-2">
              <Text className="text-3xl font-extrabold text-gray-900 dark:text-white">
                📚 Welcome Back
              </Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-400">
              Sign in to continue your reading journey
            </Text>
          </Animated.View>

          {/* Form fields with animations */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
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
                  errors.email ? "#ef4444" : isDarkMode ? "#9ca3af" : "#6b7280"
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
            entering={FadeInDown.delay(200).duration(500)}
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
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
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
                    Signing In...
                  </Text>
                </>
              ) : (
                <>
                  <Feather
                    name="log-in"
                    size={20}
                    color="white"
                    className="mr-2"
                  />
                  <Text className="text-white font-semibold">Sign In</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Forgot password link */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            className="items-end mt-3"
          >
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 dark:text-blue-400 text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </Link>
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

          {/* Register link */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500)}
            className="flex-row justify-center"
          >
            <Text className="text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                  Register
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
