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
  TextInput,
  Modal,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Book } from "@/types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";

interface ImageInfo {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
}

const ProfileScreen = () => {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [tempImage, setTempImage] = useState<ImageInfo | null>(null);

  const fetchBorrowedBooks = async () => {
    try {
      setRefreshing(true);
      const response = await api.get("/books/borrowed");
      setBorrowedBooks(response.data);
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
      Alert.alert("Error", "Failed to fetch borrowed books");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBorrowedBooks();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: logout, style: "destructive" },
    ]);
  };

  const handleReturnBook = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/return`);
      fetchBorrowedBooks();
      Alert.alert("Success", "Book returned successfully");
    } catch (error) {
      console.error("Error returning book:", error);
      Alert.alert("Error", "Failed to return book");
    }
  };

  const handleEditProfile = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      let imageUri = user?.profileImage || null;
      if (tempImage) {
        const formData = new FormData();

        // Create a file object with proper typing
        const file = {
          uri: tempImage.uri,
          name: tempImage.uri.split("/").pop() || "profile.jpg",
          type: mime.getType(tempImage.uri) || "image/jpeg",
        };

        // @ts-ignore - React Native specific FormData append
        formData.append("image", file);

        try {
          const uploadResponse = await api.post("/api/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          imageUri = uploadResponse.data.url;
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Failed to upload image");
        }
      }

      // Update user info
      const response = await api.put("/auth/me", {
        name: editName,
        email: editEmail,
        profileImage: imageUri,
      });

      updateUser(response.data);
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your photos to upload a profile picture"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setTempImage({
        uri: result.assets[0].uri,
        type: result.assets[0].type || "image",
      });
    }
  };

  const renderProfileImage = () => {
    const imageSource = tempImage?.uri || user?.profileImage || null;

    return (
      <TouchableOpacity
        onPress={() => imageSource && setImagePreviewVisible(true)}
        onLongPress={editing ? pickImage : undefined}
      >
        {imageSource ? (
          <Image
            source={{ uri: imageSource }}
            className="w-16 h-16 rounded-full mr-4"
          />
        ) : (
          <View className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full items-center justify-center mr-4">
            <MaterialIcons
              name="person"
              size={32}
              color={isDarkMode ? "#93c5fd" : "#3b82f6"}
            />
          </View>
        )}
      </TouchableOpacity>
    );
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
          Please login to view your profile
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
          My Profile
        </Text>
        <TouchableOpacity onPress={handleLogout} className="ml-auto p-2">
          <Ionicons
            name="log-out-outline"
            size={24}
            color={isDarkMode ? "#f87171" : "#ef4444"}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View
        className={`bg-white dark:bg-gray-800 mx-4 p-6 rounded-xl shadow-sm mb-6 ${
          isDarkMode ? "shadow-gray-700" : "shadow-gray-200"
        }`}
      >
        <View className="flex-row items-center mb-4">
          {renderProfileImage()}
          <View className="flex-1">
            {editing ? (
              <>
                <TextInput
                  className={`text-xl font-bold mb-2 p-2 rounded ${
                    isDarkMode
                      ? "text-white bg-gray-700 border-gray-600"
                      : "text-gray-900 bg-white border-gray-300"
                  } border`}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
                <TextInput
                  className={`p-2 rounded ${
                    isDarkMode
                      ? "text-gray-300 bg-gray-700 border-gray-600"
                      : "text-gray-600 bg-white border-gray-300"
                  } border`}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Your email"
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                  keyboardType="email-address"
                />
              </>
            ) : (
              <>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.name}
                </Text>
                <Text className="text-gray-600 dark:text-gray-300">
                  {user?.email}
                </Text>
              </>
            )}
          </View>
          {!editing ? (
            <TouchableOpacity onPress={handleEditProfile}>
              <MaterialIcons
                name="edit"
                size={24}
                color={isDarkMode ? "#93c5fd" : "#3b82f6"}
              />
            </TouchableOpacity>
          ) : (
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleSaveProfile}
                className="mr-2"
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color={isDarkMode ? "#4ade80" : "#16a34a"}
                  />
                ) : (
                  <MaterialIcons
                    name="check"
                    size={24}
                    color={isDarkMode ? "#4ade80" : "#16a34a"}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setTempImage(null);
                }}
                disabled={saving}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={isDarkMode ? "#f87171" : "#dc2626"}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {editing && (
          <View className="mb-4">
            <TouchableOpacity
              onPress={pickImage}
              className={`py-2 px-4 rounded-lg flex-row items-center ${
                isDarkMode ? "bg-blue-900" : "bg-blue-100"
              }`}
              disabled={saving}
            >
              <MaterialIcons
                name="photo-camera"
                size={20}
                color={isDarkMode ? "#93c5fd" : "#3b82f6"}
                className="mr-2"
              />
              <Text className={isDarkMode ? "text-blue-200" : "text-blue-800"}>
                {tempImage ? "Change Image" : "Add Profile Image"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {borrowedBooks.length}
            </Text>
            <Text className="text-gray-600 dark:text-gray-300">Borrowed</Text>
          </View>
        </View>
      </View>

      {/* Borrowed Books Section */}
      <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 px-4 mb-3">
        📖 My Borrowed Books
      </Text>

      <FlatList
        data={borrowedBooks}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchBorrowedBooks}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        renderItem={renderBookItem}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-6">
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
        }
        contentContainerStyle={
          borrowedBooks.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
        }
      />

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreviewVisible}
        transparent={true}
        onRequestClose={() => setImagePreviewVisible(false)}
      >
        <View className="flex-1 bg-black/90 items-center justify-center">
          <TouchableOpacity
            className="absolute top-16 right-8 z-10"
            onPress={() => setImagePreviewVisible(false)}
          >
            <MaterialIcons name="close" size={32} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: tempImage?.uri || user?.profileImage || "" }}
            className="w-full h-2/3"
            resizeMode="contain"
          />
          {editing && (
            <TouchableOpacity
              className="mt-4 bg-blue-500 py-2 px-6 rounded-full"
              onPress={pickImage}
            >
              <Text className="text-white font-medium">Change Image</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
