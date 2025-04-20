import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { Link } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Book } from "@/types";
import { Picker as RNPicker } from "@react-native-picker/picker";
import { useColorScheme } from "@/hooks/useColorScheme";

const PAGE_SIZE = 20;
const BOOKS_PER_ROW = 3; // 2.5 shown, last clipped in view

const getGenreEmoji = (genre: string) => {
  const emojis: Record<string, string> = {
    Drama: "🎭",
    Romance: "💖",
    Fantasy: "🧝",
    Science: "🔬",
    Horror: "👻",
    Mystery: "🕵️",
    Historical: "🏰",
    Fiction: "📖",
    Classic: "📘",
    Adventure: "🗺️",
    Dystopian: "🌆",
    "Magical Realism": "✨",
    "Literary Fiction": "✍️",
    Epic: "🏛️",
    Mythology: "🏺",
    Poetry: "📜",
    "Philosophical Fiction": "🤔",
    "Psychological Fiction": "🧠",
    Gothic: "🏚️",
    Satire: "🤡",
    "Children's Literature": "🧒",
    Fable: "🦊",
    War: "⚔️",
    "Social Commentary": "🗣️",
    "Feminist Fiction": "♀️",
    "Absurdist Fiction": "🤪",
    Existential: "☁️",
    Nature: "🌲",
    "Post-Apocalyptic": "💀",
    Mythopoeia: "🧙",
    Comedy: "😂",
  };
  return emojis[genre] || "📚";
};

const LibraryScreen = () => {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (books.length > 0) {
      // Extract all unique genres from books
      const genres = new Set<string>();
      books.forEach((book) => {
        if (book["genre/0"]) genres.add(book["genre/0"]);
        if (book["genre/1"]) genres.add(book["genre/1"]);
      });
      setAvailableGenres(["All", ...Array.from(genres).sort()]);

      // Apply initial filter
      filterBooks("All");
    }
  }, [books]);

  const loadBooks = async () => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await api.get(`/books?page=${page}&limit=${PAGE_SIZE}`);
      const newBooks = response.data;

      if (newBooks.length < PAGE_SIZE) setHasMore(false);

      setBooks((prev) => [...prev, ...newBooks]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterBooks = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === "All") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(
        (book) =>
          (book["genre/0"] && book["genre/0"] === genre) ||
          (book["genre/1"] && book["genre/1"] === genre)
      );
      setFilteredBooks(filtered);
    }
  };

  // Divide books into rows
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

  if (authLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const groupedBooks = groupBooks(filteredBooks, BOOKS_PER_ROW);

  return (
    <View className="flex-1 px-4 pt-16 pb-6 bg-white dark:bg-black">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
          📚 Library
        </Text>
        <Text className="text-gray-600 dark:text-gray-400">
          {isAuthenticated && user
            ? `Welcome, ${user.name || "there"} 👋`
            : "Login to start borrowing"}
        </Text>
      </View>

      {/* Genre Selector */}
      <View className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <RNPicker
          selectedValue={selectedGenre}
          onValueChange={(itemValue) => filterBooks(itemValue)}
          style={{ color: isDarkMode ? "white" : "black" }}
          dropdownIconColor={isDarkMode ? "white" : "black"}
        >
          {availableGenres.map((genre) => (
            <RNPicker.Item
              key={genre}
              label={`${getGenreEmoji(genre)} ${genre}`}
              value={genre}
            />
          ))}
        </RNPicker>
      </View>

      {/* Books List */}
      {filteredBooks.length > 0 ? (
        <FlatList
          data={groupedBooks}
          keyExtractor={(_, index) => `row-${index}`}
          renderItem={renderHorizontalRow}
          onEndReached={() => {
            if (hasMore && !loadingMore && selectedGenre === "All") loadBooks();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">
            No books found in this genre
          </Text>
        </View>
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

export default LibraryScreen;
