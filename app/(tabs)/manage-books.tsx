import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
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

const ManageBooksScreen = () => {
  const { isAuthenticated, user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const fetchBooks = async () => {
    try {
      setRefreshing(true);
      const response = await api.get("/books");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      Alert.alert("Error", "Failed to fetch books");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated]);

  const handleDeleteBook = async (bookId: string) => {
    try {
      await api.delete(`/books/${bookId}`);
      fetchBooks();
      Alert.alert("Success", "Book deleted successfully");
    } catch (error) {
      console.error("Error deleting book:", error);
      Alert.alert("Error", "Failed to delete book");
    }
  };

  const confirmDelete = (bookId: string) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => handleDeleteBook(bookId),
        style: "destructive",
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-800 dark:text-gray-200 mb-4">
          Please login to manage books
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
          Manage Books
        </Text>
        <Link href="/books/add-book" asChild className="ml-auto">
          <TouchableOpacity className="bg-green-500 dark:bg-green-600 px-4 py-2 rounded-lg flex-row items-center">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-1">Add Book</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchBooks}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        renderItem={({ item }) => (
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
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Published: {item.publication_year}
                </Text>
              </View>
            </View>

            <View className="flex-row mt-4 gap-3">
              <Link href={`/books/edit/${item._id}`} asChild>
                <TouchableOpacity className="flex-1 bg-blue-100 dark:bg-blue-900 py-3 rounded-lg flex-row items-center justify-center space-x-2">
                  <Ionicons
                    name="pencil"
                    size={18}
                    color={isDarkMode ? "#bfdbfe" : "#2563eb"}
                  />
                  <Text className="text-blue-600 dark:text-blue-200 font-medium">
                    Edit
                  </Text>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity
                className="flex-1 bg-red-100 dark:bg-red-900 py-3 rounded-lg flex-row items-center justify-center space-x-2"
                onPress={() => confirmDelete(item._id)}
              >
                <Ionicons
                  name="trash"
                  size={18}
                  color={isDarkMode ? "#fecaca" : "#dc2626"}
                />
                <Text className="text-red-600 dark:text-red-200 font-medium">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-6">
            <Ionicons name="book" size={48} color="#9ca3af" className="mb-4" />
            <Text className="text-lg text-gray-500 dark:text-gray-400 text-center mb-4">
              No books found
            </Text>
            <Link href="/books/add-book" asChild>
              <TouchableOpacity className="bg-blue-500 py-2 px-6 rounded-full">
                <Text className="text-white font-medium">
                  Add Your First Book
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        }
        contentContainerStyle={
          books.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
        }
      />
    </View>
  );
};

export default ManageBooksScreen;
