import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { View } from "react-native";
import Header from "../../components/Header";
import { verifyUserInFirebase } from "../../utils/authUtils";

/**
 * Layout de las tabs principales.
 * Verifica usuario en cada cambio de tab y refresca el header.
 */
export default function TabLayout() {
  const router = useRouter();

  // Verifica usuario cada vez que la tab obtiene el foco
  useFocusEffect(
    useCallback(() => {
      verifyUserInFirebase(router);
    }, [router])
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      {/* Header siempre visible y actualizado */}
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="VaccineRecord"
          options={{
            tabBarLabel: "VaccineRecord",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="history" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
