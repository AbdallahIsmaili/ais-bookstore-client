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
import Toast from "react-native-toast-message";

const MyBooksScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [returningBookId, setReturningBookId] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };


  const getDueDateStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) return "Overdue";
    if (daysRemaining === 0) return "Due today";
    if (daysRemaining === 1) return "Due tomorrow";
    return `Due in ${daysRemaining} days`;
  };

  const fetchBooks = async () => {
    try {
      setRefreshing(true);
      const response = await api.get("/books/borrowed");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load borrowed books",
        position: "bottom",
      });
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
    fetchBooks();
  };

  const handleReturnBook = async (bookId: string) => {
    try {
      setReturningBookId(bookId);
      await api.post(`/books/${bookId}/return`);

      // Optimistically update the UI
      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Book returned successfully!",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error returning book:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to return book",
        position: "bottom",
      });
      // Refresh to get actual state if optimistic update was wrong
      fetchBooks();
    } finally {
      setReturningBookId(null);
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

          {item.borrowedDate && item.dueDate && (
            <View className="mt-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Borrowed on: {new Date(item.borrowedDate).toLocaleDateString()}
              </Text>
              <Text
                className={`text-sm ${
                  getDaysRemaining(item.dueDate) <= 3
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {getDueDateStatus(getDaysRemaining(item.dueDate))}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row mt-4 gap-3">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg flex-row items-center justify-center space-x-2 ${
            isDarkMode ? "bg-red-900" : "bg-red-100"
          }`}
          onPress={() => handleReturnBook(item._id)}
          disabled={returningBookId === item._id}
        >
          {returningBookId === item._id ? (
            <ActivityIndicator
              size="small"
              color={isDarkMode ? "#fecaca" : "#dc2626"}
            />
          ) : (
            <>
              <Ionicons
                name="return-up-back"
                size={18}
                color={isDarkMode ? "#fecaca" : "#dc2626"}
              />
              <Text
                className={`font-medium ${
                  isDarkMode ? "text-red-200" : "text-red-600"
                }`}
              >
                Return
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg flex-row items-center justify-center space-x-2 ${
            isDarkMode ? "bg-blue-900" : "bg-blue-100"
          }`}
          onPress={() => router.push(`/books/detail/${item._id}`)}
        >
          <Ionicons
            name="information-circle"
            size={18}
            color={isDarkMode ? "#bfdbfe" : "#2563eb"}
          />
          <Text
            className={`font-medium ${
              isDarkMode ? "text-blue-200" : "text-blue-600"
            }`}
          >
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
