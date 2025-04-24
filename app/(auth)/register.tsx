import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterScreen = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");
    try {
      await register(data.name, data.email, data.password);
      router.back();
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 pt-12 p-6 bg-gray-50 dark:bg-gray-900">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Account
        </Text>
        <Text className="text-gray-600 dark:text-gray-300">
          Join our book community
        </Text>
      </View>

      {error && (
        <View className="mb-4 p-3 bg-red-100 dark:bg-red-900 rounded">
          <Text className="text-red-700 dark:text-red-200">{error}</Text>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Name
        </Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`bg-white dark:bg-gray-800 border ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg p-3`}
              placeholder="John Doe"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="name"
          defaultValue=""
        />
        {errors.name && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.name.message}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`bg-white dark:bg-gray-800 border ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg p-3`}
              placeholder="john@example.com"
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
        {errors.email && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.email.message}
          </Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`bg-white dark:bg-gray-800 border ${
                errors.password
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg p-3`}
              placeholder="••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="password"
          defaultValue=""
        />
        {errors.password && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.password.message}
          </Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-blue-500 py-3 rounded-lg mb-4"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-medium">
            Create Account
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
        </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="text-blue-500 font-medium">Sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default RegisterScreen;
