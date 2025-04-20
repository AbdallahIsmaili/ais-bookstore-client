import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Book } from "@/types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const BookDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setBook(response.data);
      } catch (err) {
        setError("Failed to fetch book details");
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleBorrow = async () => {
    try {
      await api.post(`/books/${id}/borrow`);
      router.back();
    } catch (err) {
      setError("Failed to borrow book. Please try again.");
      console.error("Borrow error:", err);
    }
  };

  const handleReturn = async () => {
    try {
      await api.post(`/books/${id}/return`);
      router.back();
    } catch (err) {
      setError("Failed to return book. Please try again.");
      console.error("Return error:", err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-800 dark:text-gray-200">
          Book not found
        </Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-2 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 pt-16 bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      <View className="h-64 bg-gray-200 dark:bg-gray-800 relative">
        {book.cover_image ? (
          <Image
            source={{ uri: book.cover_image }}
            className="w-full h-full"
            resizeMode="contain"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="menu-book" size={80} color="#9ca3af" />
          </View>
        )}
      </View>

      {/* Book Details */}
      <View className="p-6">
        {/* Title and Author */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {book.title}
          </Text>
          <Text className="text-lg text-gray-600 dark:text-gray-300">
            by {book.author}
          </Text>
        </View>

        {/* Metadata */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
            <Text className="text-blue-800 dark:text-blue-200">
              {book.publication_year}
            </Text>
          </View>
          {book["genre/0"] && (
            <View className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">
              <Text className="text-purple-800 dark:text-purple-200">
                {book["genre/0"]}
              </Text>
            </View>
          )}
          {book["genre/1"] && (
            <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
              <Text className="text-green-800 dark:text-green-200">
                {book["genre/1"]}
              </Text>
            </View>
          )}
          <View
            className={`px-3 py-1 rounded-full ${
              book.isAvailable
                ? "bg-green-100 dark:bg-green-900"
                : "bg-red-100 dark:bg-red-900"
            }`}
          >
            <Text
              className={
                book.isAvailable
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }
            >
              {book.isAvailable ? "Available" : "Borrowed"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Description
          </Text>
          <Text className="text-gray-700 dark:text-gray-300">
            {book.description || "No description available."}
          </Text>
        </View>

        {/* Borrow/Return Button */}
        {isAuthenticated && (
          <View className="mb-6">
            {book.isAvailable ? (
              <TouchableOpacity
                className="bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
                onPress={handleBorrow}
              >
                <Ionicons name="book-outline" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Borrow Book</Text>
              </TouchableOpacity>
            ) : book.borrower === user?.id ? (
              <TouchableOpacity
                className="bg-green-500 py-3 rounded-lg flex-row items-center justify-center"
                onPress={handleReturn}
              >
                <Ionicons name="return-up-back" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Return Book</Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-200 dark:bg-gray-700 py-3 rounded-lg">
                <Text className="text-center text-gray-700 dark:text-gray-300">
                  Currently borrowed by another user
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View className="mb-4 p-3 bg-red-100 dark:bg-red-900 rounded">
            <Text className="text-red-700 dark:text-red-200">{error}</Text>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          className="border border-gray-300 dark:border-gray-600 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-center text-gray-700 dark:text-gray-300">
            Back to Library
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default BookDetailScreen;
