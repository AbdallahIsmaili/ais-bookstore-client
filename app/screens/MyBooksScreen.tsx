import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Book } from "@/types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";

const MyBooksScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const fetchBooks = async () => {
    try {
      const response = await api.get("/books/borrowed");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  const handleReturnBook = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/return`);
      fetchBooks();
    } catch (error) {
      console.error("Error returning book:", error);
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <View
      className={`bg-white dark:bg-gray-800 p-4 mb-4 mx-4 rounded-xl shadow-sm ${
        isDarkMode ? "shadow-gray-700" : "shadow-gray-200"
      }`}
    >
      <View className="flex-row">
        {item.cover_image ? (
          <Image
            source={{ uri: item.cover_image }}
            className="w-16 h-24 rounded-lg mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-24 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4 items-center justify-center">
            <MaterialIcons
              name="menu-book"
              size={24}
              color={isDarkMode ? "#93c5fd" : "#3b82f6"}
            />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-bold text-lg text-gray-900 dark:text-white mb-1">
            {item.title}
          </Text>
          <Text className="text-gray-600 dark:text-gray-300 mb-2">
            {item.author}
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-2">
            {item["genre/0"] && (
              <View className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">
                <Text className="text-purple-800 dark:text-purple-200 text-xs">
                  {item["genre/0"]}
                </Text>
              </View>
            )}
            {item["genre/1"] && (
              <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                <Text className="text-green-800 dark:text-green-200 text-xs">
                  {item["genre/1"]}
                </Text>
              </View>
            )}
          </View>

          {item.borrowedDate && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Borrowed on: {new Date(item.borrowedDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row mt-4 gap-3">
        <TouchableOpacity
          className="flex-1 bg-red-100 dark:bg-red-900 py-3 rounded-lg flex-row items-center justify-center space-x-2"
          onPress={() => handleReturnBook(item._id)}
        >
          <Ionicons
            name="return-up-back"
            size={18}
            color={isDarkMode ? "#fecaca" : "#dc2626"}
          />
          <Text className="text-red-600 dark:text-red-200 font-medium">
            Return
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-blue-100 dark:bg-blue-900 py-3 rounded-lg flex-row items-center justify-center space-x-2"
          onPress={() => router.push(`/books/detail/${item._id}`)}
        >
          <Ionicons
            name="information-circle"
            size={18}
            color={isDarkMode ? "#bfdbfe" : "#2563eb"}
          />
          <Text className="text-blue-600 dark:text-blue-200 font-medium">
            Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-800 dark:text-gray-200 mb-4">
          Please login to view your borrowed books
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="bg-blue-500 py-3 px-6 rounded-lg">
            <Text className="text-white font-medium">Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 pt-16 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "white" : "black"}
          />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            My Borrowed Books
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {books.length} book{books.length !== 1 ? "s" : ""} currently
            borrowed
          </Text>
        </View>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center h-full">
            <View className="items-center p-6">
              <Ionicons
                name="library-outline"
                size={48}
                color="#9ca3af"
                className="mb-4"
              />
              <Text className="text-lg text-gray-500 dark:text-gray-400 text-center mb-4">
                You haven't borrowed any books yet
              </Text>
              <Link href="/" asChild>
                <TouchableOpacity className="bg-blue-500 py-2 px-6 rounded-full">
                  <Text className="text-white font-medium">Browse Books</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        }
        renderItem={renderBookItem}
        contentContainerStyle={
          books.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
        }
      />
    </View>
  );
};

export default MyBooksScreen;