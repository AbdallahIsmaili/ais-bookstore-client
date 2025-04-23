import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import api from "@/services/api";
import { Book } from "@/types";

const PAGE_SIZE = 20;
const BOOKS_PER_ROW = 3;

const BookSourcesScreen = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const searchBooks = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/books/google-books/search`, {
        params: { q: searchQuery },
      });

      if (Array.isArray(response.data)) {
        setBooks(response.data);
      } else {
        setError("Unexpected response format");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  // Divide books into rows of 3
  const groupBooks = (books: Book[], groupSize: number): Book[][] => {
    const rows: Book[][] = [];
    for (let i = 0; i < books.length; i += groupSize) {
      rows.push(books.slice(i, i + groupSize));
    }
    return rows;
  };

  const renderBookCard = (item: Book) => (
    <View
      key={item._id}
      className="bg-white dark:bg-gray-800 mr-4 p-3 rounded-lg shadow w-44"
    >
      {item.cover_image ? (
        <Image
          source={{ uri: item.cover_image }}
          className="w-full h-40 rounded mb-2"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 bg-blue-100 dark:bg-blue-900 rounded mb-2 items-center justify-center">
          <MaterialIcons
            name="menu-book"
            size={32}
            color={isDarkMode ? "#93c5fd" : "#3b82f6"}
          />
        </View>
      )}
      <Text
        className="font-semibold text-gray-900 dark:text-white"
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text
        className="text-sm text-gray-500 dark:text-gray-400 mb-2"
        numberOfLines={1}
      >
        {item.author}
      </Text>
      <Link href={`/books/google/details/${item.id}`} asChild>
        <TouchableOpacity className="mt-1 bg-blue-600 dark:bg-blue-700 rounded py-2">
          <Text className="text-white dark:text-blue-100 text-xs text-center">
            View Details
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  const renderHorizontalRow = ({
    item,
    index,
  }: {
    item: Book[];
    index: number;
  }) => (
    <View key={`row-${index}`} className="mb-6">
      <FlatList
        horizontal
        data={item}
        keyExtractor={(book, index) => `book-${book._id || index}`}
        renderItem={({ item }) => renderBookCard(item)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4 }}
      />
    </View>
  );

  const groupedBooks = groupBooks(books, BOOKS_PER_ROW);

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-16 pb-6 bg-white dark:bg-black">
      {/* Header */}
      <View className="mb-6">
        <View className="flex-row items-center space-x-3 mb-1">
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
            }}
            style={{ width: 90, height: 35 }}
            resizeMode="contain"
          />
          <Text className="text-3xl font-extrabold text-gray-900 dark:text-white">
            &nbsp;Books
          </Text>
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          Powered by Google Books API
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row mb-6">
        <TextInput
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-2 text-gray-900 dark:text-white"
          placeholder="Search for books..."
          placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchBooks}
          returnKeyType="search"
        />
        <TouchableOpacity
          className="bg-blue-600 dark:bg-blue-700 px-4 py-2 rounded-r-lg items-center justify-center"
          onPress={searchBooks}
        >
          <Feather name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View className="py-4">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      {/* Error Message */}
      {error ? (
        <View className="py-4 items-center">
          <Text className="text-red-500 dark:text-red-400">{error}</Text>
        </View>
      ) : null}

      {/* Results */}
      {books.length > 0 ? (
        <FlatList
          data={groupedBooks}
          key={`grouped-${BOOKS_PER_ROW}-${groupedBooks.length}`}
          keyExtractor={(_, index) => `row-${index}`}
          renderItem={renderHorizontalRow}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        !loading && (
          <View className="flex-1 items-center justify-center px-6">
            <MaterialIcons
              name="search-off"
              size={64}
              color={isDarkMode ? "#6b7280" : "#9ca3af"}
              style={{ marginBottom: 16 }}
            />
            <Text className="text-xl text-center font-medium text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No books found.\nTry a different search term."
                : "Search for books to see results."}
            </Text>
          </View>
        )
      )}

      {/* Auth Buttons */}
      <View className="space-y-3 mt-6">
        {isAuthenticated ? (
          <>
            <Link href="/screens/MyBooksScreen" asChild>
              <TouchableOpacity className="bg-blue-600 py-3 px-4 rounded-xl flex-row items-center justify-center">
                <MaterialIcons name="library-books" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  My Borrowed Books
                </Text>
              </TouchableOpacity>
            </Link>
          </>
        ) : (
          <>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity className="bg-blue-600 py-3 px-4 rounded-xl flex-row items-center justify-center">
                <Feather name="user-plus" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Register</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity className="border border-blue-600 py-3 px-4 rounded-xl flex-row items-center justify-center">
                <Feather name="log-in" size={20} color="#3B82F6" />
                <Text className="text-blue-600 font-semibold ml-2">Login</Text>
              </TouchableOpacity>
            </Link>
          </>
        )}
      </View>
    </View>
  );
};

export default BookSourcesScreen;
