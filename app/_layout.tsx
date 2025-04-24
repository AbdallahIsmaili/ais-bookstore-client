import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Toast configuration
const toastConfig = {
  success: (props: any) => (
    <View className="bg-green-500 dark:bg-green-700 p-4 rounded-lg mx-4 mb-4 flex-row items-start">
      <MaterialIcons
        name="check-circle"
        size={24}
        color="white"
        className="mr-3"
      />
      <View className="flex-1">
        <Text className="text-white font-semibold">{props.text1}</Text>
        <Text className="text-white opacity-90">{props.text2}</Text>
      </View>
    </View>
  ),
  error: (props: any) => (
    <View className="bg-red-500 dark:bg-red-700 p-4 rounded-lg mx-4 mb-4 flex-row items-start">
      <MaterialIcons
        name="error-outline"
        size={24}
        color="white"
        className="mr-3"
      />
      <View className="flex-1">
        <Text className="text-white font-semibold">{props.text1}</Text>
        <Text className="text-white opacity-90">{props.text2}</Text>
      </View>
    </View>
  ),
  info: (props: any) => (
    <View className="bg-blue-500 dark:bg-blue-700 p-4 rounded-lg mx-4 mb-4 flex-row items-start">
      <MaterialIcons name="info" size={24} color="white" className="mr-3" />
      <View className="flex-1">
        <Text className="text-white font-semibold">{props.text1}</Text>
        <Text className="text-white opacity-90">{props.text2}</Text>
      </View>
    </View>
  ),
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_bottom",
            presentation: "modal",
            gestureEnabled: true,
            contentStyle: {
              backgroundColor: colorScheme === "dark" ? "#1a202c" : "#f8fafc",
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />

          {/* Modal screens */}
          <Stack.Screen name="screens/MyBooksScreen" />
          <Stack.Screen name="books/detail/[id]" />
          <Stack.Screen name="books/add-book" />
          <Stack.Screen name="books/edit/[id]" />

          <Stack.Screen name="+not-found" />
        </Stack>

        {/* Toast component with config */}
        <Toast
          topOffset={insets.top}
          visibilityTime={4000}
          config={toastConfig}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}
