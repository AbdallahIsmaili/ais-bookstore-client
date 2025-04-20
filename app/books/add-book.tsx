import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  publication_year: z.coerce
    .number()
    .min(1000, "Invalid year")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  "genre/0": z.string().min(1, "Primary genre is required"),
  "genre/1": z.string().optional(),
  cover_image: z.string().url("Invalid URL").optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

const AddBookScreen = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      publication_year: new Date().getFullYear(),
      "genre/0": "",
      "genre/1": "",
      cover_image: "",
    },
  });

  const coverImage = watch("cover_image");

  const onSubmit = async (data: BookFormData) => {
    try {
      setLoading(true);
      setError("");
      await api.post("/books", data);
      router.back();
    } catch (err) {
      setError("Failed to add book. Please try again.");
      console.error("Add book error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-800 dark:text-gray-200 mb-4">
          Please login to add books
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="bg-blue-500 py-3 px-6 rounded-lg">
            <Text className="text-white font-medium">Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-16 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Add New Book
        </Text>
      </View>

      <ScrollView className="px-4 pb-6">
        {error && (
          <View className="mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            <Text className="text-red-700 dark:text-red-200">{error}</Text>
          </View>
        )}

        {/* Cover Image Preview */}
        {coverImage ? (
          <View className="mb-4 items-center">
            <Image
              source={{ uri: coverImage }}
              className="w-32 h-48 rounded-lg mb-2"
              resizeMode="cover"
            />
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Cover Preview
            </Text>
          </View>
        ) : (
          <View className="mb-4 items-center">
            <View className="w-32 h-48 bg-blue-100 dark:bg-blue-900 rounded-lg items-center justify-center">
              <MaterialIcons
                name="menu-book"
                size={32}
                color={isDarkMode ? "#93c5fd" : "#3b82f6"}
              />
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              No cover image
            </Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Title
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } border text-gray-900 dark:text-white`}
                placeholder="Book title"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="title"
          />
          {errors.title && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.title.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Author
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } border text-gray-900 dark:text-white`}
                placeholder="Author name"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="author"
          />
          {errors.author && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.author.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Description
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } border h-32 text-gray-900 dark:text-white`}
                placeholder="Book description"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
                textAlignVertical="top"
              />
            )}
            name="description"
          />
          {errors.description && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Publication Year
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } border text-gray-900 dark:text-white`}
                placeholder="Publication year"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text ? parseInt(text) : "")}
                value={value ? value.toString() : ""}
                keyboardType="numeric"
              />
            )}
            name="publication_year"
          />
          {errors.publication_year && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.publication_year.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Primary Genre
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } border text-gray-900 dark:text-white`}
                placeholder="Primary genre"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="genre/0"
          />
          {errors["genre/0"] && (
            <Text className="text-red-500 text-sm mt-1">
              {errors["genre/0"].message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Secondary Genre (Optional)
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } border text-gray-900 dark:text-white`}
                placeholder="Secondary genre"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="genre/1"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Cover Image URL (Optional)
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } border text-gray-900 dark:text-white`}
                placeholder="https://example.com/book-cover.jpg"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="url"
              />
            )}
            name="cover_image"
          />
          {errors.cover_image && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.cover_image.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          className={`py-4 rounded-xl flex-row items-center justify-center ${
            loading
              ? "bg-blue-400 dark:bg-blue-700"
              : "bg-blue-500 dark:bg-blue-600"
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="white" />
              <Text className="text-white font-medium ml-2">Adding...</Text>
            </>
          ) : (
            <>
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Add Book</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddBookScreen;
