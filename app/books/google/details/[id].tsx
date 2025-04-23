import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  LayoutAnimation,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import api from "@/services/api";
import { stripHtmlTags } from "@/utils/htmlUtils";

// Add this constant for max length before truncation
const MAX_DESCRIPTION_LENGTH = 300;

interface GoogleBook {
  id: string;
  title: string;
  author: string;
  description: string;
  publication_year: number;
  cover_image: string;
  previewLink?: string;
  infoLink?: string;
}

const GoogleBookDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<GoogleBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/google-books/${id}`);
        const bookData = response.data;

        setBook({
          id: bookData.id,
          title: bookData.title,
          author: bookData.author,
          description: stripHtmlTags(bookData.description),
          publication_year: bookData.publication_year,
          cover_image: bookData.cover_image,
          previewLink: bookData.previewLink,
          infoLink: bookData.infoLink,
        });
      } catch (err) {
        setError("Failed to fetch book details");
        console.error("Error fetching Google Book:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const toggleDescription = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const getTruncatedDescription = (text: string) => {
    if (!text) return "No description available.";
    if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
    return text.substring(0, MAX_DESCRIPTION_LENGTH) + "...";
  };

  const handleReadBook = () => {
    if (book?.previewLink) {
      Linking.openURL(book.previewLink);
    } else if (book?.infoLink) {
      Linking.openURL(book.infoLink);
    } else {
      setError("No reading link available for this book");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#3b82f6" : "#2563eb"}
        />
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
          className={`mt-4 ${
            isDarkMode ? "bg-blue-700" : "bg-blue-500"
          } px-6 py-2 rounded-full`}
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
            <MaterialIcons
              name="menu-book"
              size={80}
              color={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
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
          <View
            className={`${
              isDarkMode ? "bg-blue-900" : "bg-blue-100"
            } px-3 py-1 rounded-full`}
          >
            <Text className={isDarkMode ? "text-blue-200" : "text-blue-800"}>
              {book.publication_year}
            </Text>
          </View>
          <View
            className={`${
              isDarkMode ? "bg-purple-900" : "bg-purple-100"
            } px-3 py-1 rounded-full`}
          >
            <Text
              className={isDarkMode ? "text-purple-200" : "text-purple-800"}
            >
              Google Book
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Description
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            {book.description
              ? expanded
                ? book.description
                : getTruncatedDescription(book.description)
              : "No description available."}
          </Text>
          {book.description &&
            book.description.length > MAX_DESCRIPTION_LENGTH && (
              <TouchableOpacity onPress={toggleDescription}>
                <Text
                  className={`text-sm ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  } font-medium`}
                >
                  {expanded ? "Read Less" : "Read More"}
                </Text>
              </TouchableOpacity>
            )}
        </View>

        {/* Read Button */}
        <View className="mb-6">
          <TouchableOpacity
            className={`${
              isDarkMode ? "bg-green-700" : "bg-green-600"
            } py-3 rounded-lg flex-row items-center justify-center`}
            onPress={handleReadBook}
          >
            <Ionicons name="book-outline" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Read Book</Text>
          </TouchableOpacity>
        </View>

        {/* More Info Button */}
        <View className="mb-6">
          <TouchableOpacity
            className={`${
              isDarkMode ? "bg-blue-700" : "bg-blue-600"
            } py-3 rounded-lg flex-row items-center justify-center`}
            onPress={() => book.infoLink && Linking.openURL(book.infoLink)}
          >
            <MaterialIcons name="info-outline" size={20} color="white" />
            <Text className="text-white font-medium ml-2">More Info</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View
            className={`mb-4 p-3 ${
              isDarkMode ? "bg-red-900" : "bg-red-100"
            } rounded`}
          >
            <Text className={isDarkMode ? "text-red-200" : "text-red-700"}>
              {error}
            </Text>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          className={`border ${
            isDarkMode ? "border-gray-600" : "border-gray-300"
          } py-3 rounded-lg`}
          onPress={() => router.back()}
        >
          <Text className="text-center text-gray-700 dark:text-gray-300">
            Back to Search
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GoogleBookDetailScreen;
