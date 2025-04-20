import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "@/app/(auth)/login";
import RegisterScreen from "@/app/(auth)/register";
import MyBooksScreen from "@/app/screens/MyBooksScreen";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Books") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "My Books") {
            iconName = focused ? "library" : "library-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Books" component={BookListScreen} />
      <Tab.Screen name="My Books" component={MyBooksScreen} />
    </Tab.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="login"
      component={LoginScreen}
      options={{ title: "Sign In" }}
    />
    <Stack.Screen
      name="register"
      component={RegisterScreen}
      options={{ title: "Create Account" }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="(tabs)"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="book-detail/[id]"
            component={BookDetailScreen}
            options={{ title: "Book Details" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="(auth)"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
