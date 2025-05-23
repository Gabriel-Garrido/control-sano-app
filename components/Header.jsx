import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../config/FirebaseConfig";
import Colors from "../constant/Colors";
import { getLocalStorage, RemoveLocalStorage } from "../service/Storage";

/**
 * Header superior: muestra logo, saludo y botón de logout.
 * Mejor UX/UI: disposición horizontal, avatar, nombre grande y botón accesible.
 */
export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Obtiene los detalles del usuario desde localStorage
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

  // Maneja el cierre de sesión con confirmación multiplataforma
  const handleLogout = () => {
    if (Platform.OS === "web") {
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
      import("react-native").then(({ Alert }) => {
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
      });
    }
  };

  return (
    <View style={headerStyles.headerWrapper}>
      <View style={headerStyles.headerRow}>
        {/* Logo y saludo */}
        <View style={headerStyles.logoRow}>
          <Image
            source={require("../assets/images/icon.png")}
            style={headerStyles.logo}
          />
          <View>
            <Text style={headerStyles.helloText}>
              ¡Hola, {user?.displayName || "Usuario"}!
            </Text>
            <Text style={headerStyles.emailText} numberOfLines={1}>
              {user?.email || ""}
            </Text>
          </View>
        </View>
        {/* Botón logout */}
        <TouchableOpacity
          onPress={handleLogout}
          accessibilityLabel="Cerrar sesión"
          style={headerStyles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={30} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos mejorados para header móvil
const headerStyles = {
  headerWrapper: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 32 : 18,
    paddingBottom: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 8,
    elevation: 2,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 4px rgba(0,0,0,0.04)" }
      : {}),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  helloText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 2,
  },
  emailText: {
    fontSize: 13,
    color: Colors.DARK_GRAY,
    maxWidth: 160,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f7fa",
    marginLeft: 8,
  },
};
