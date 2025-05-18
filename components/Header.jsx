import { View, Text, Image, Alert, TouchableOpacity, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { getLocalStorage, RemoveLocalStorage } from "../service/Storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "../constant/Colors";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../config/FirebaseConfig";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const GetUserDetails = async () => {
    try {
      const userInfo = await getLocalStorage("userDetail");
      setUser(userInfo);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    GetUserDetails();
  }, []);

  const handleLogout = () => {
    if (Platform.OS === "web") {
      // Usar confirm nativo en web
      if (window.confirm("¿Seguro que deseas cerrar sesión?")) {
        signOut(auth)
          .then(async () => {
            await RemoveLocalStorage();
            router.replace("/login/signIn");
          })
          .catch(() => {
            window.alert("No se pudo cerrar sesión.");
          });
      }
    } else {
      // Usar Alert en móvil
      Alert.alert(
        "Cerrar sesión",
        "¿Seguro que deseas cerrar sesión?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sí, cerrar sesión",
            style: "destructive",
            onPress: async () => {
              try {
                await signOut(auth);
                await RemoveLocalStorage();
                router.replace("/login/signIn");
              } catch (e) {
                Alert.alert("Error", "No se pudo cerrar sesión.");
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View
      style={{
        marginTop: 20,
        paddingHorizontal: 15,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/images/icon.png")}
            style={{
              width: 45,
              height: 45,
              marginRight: 10,
            }}
          />
          <Text
            style={{
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            Hello {user?.displayName || "Guest"} 👋
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} accessibilityLabel="Cerrar sesión">
          <Ionicons name="log-out-outline" size={34} color={Colors.DARK_GRAY} />
        </TouchableOpacity>
      </View>
    </View>
  );
}