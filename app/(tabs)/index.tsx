import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { Link } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Book } from "@/types";
import { useColorScheme } from "@/hooks/useColorScheme";

const PAGE_SIZE = 20;
const BOOKS_PER_ROW = 3;

const HomeScreen = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [initialLoad, setInitialLoad] = useState(true);

  const loadBooks = async () => {
    try {
      if (page === 1 && initialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.get(`/books?page=${page}&limit=${PAGE_SIZE}`);
      const newBooks = response.data;

      if (newBooks.length < PAGE_SIZE) {
        setHasMore(false);
      }

      // Only append new books if we're not on the first page
      setBooks((prev) => (page === 1 ? newBooks : [...prev, ...newBooks]));

      // Update page only if we successfully got new books
      if (newBooks.length > 0) {
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []); // Empty dependency array to run only once on mount

  // Divide books into rows
  const groupBooks = (books: Book[], groupSize: number): Book[][] => {
    const rows: Book[][] = [];
    for (let i = 0; i < books.length; i += groupSize) {
      rows.push(books.slice(i, i + groupSize));
    }
    return rows;
  };

  const groupedBooks = groupBooks(books, BOOKS_PER_ROW);

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
      <Link href={`/books/detail/${item._id}`} asChild>
        <TouchableOpacity className="mt-1 bg-blue-600 dark:bg-blue-700 rounded py-2">
          <Text className="text-white dark:text-blue-100 text-xs text-center">
            See Details
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
        keyExtractor={(book) => `book-${book._id}`}
        renderItem={({ item }) => renderBookCard(item)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4 }}
      />
    </View>
  );

  const renderFooter = () =>
    loadingMore ? (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    ) : null;

  if (authLoading || (loading && initialLoad)) {
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
        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
          📚 BookStore
        </Text>
        <Text className="text-gray-600 dark:text-gray-400">
          {isAuthenticated && user
            ? `Welcome, ${user.name || "there"} 👋`
            : "Login to start borrowing"}
        </Text>
      </View>

      {/* Featured Books */}
      <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
        📖 Featured Books
      </Text>
      <FlatList
        data={groupedBooks}
        keyExtractor={(_, index) => `row-${index}`}
        renderItem={renderHorizontalRow}
        onEndReached={() => {
          if (hasMore && !loadingMore) loadBooks();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />

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

export default HomeScreen;
