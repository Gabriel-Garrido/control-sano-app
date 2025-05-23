import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "../constant/Colors";

/**
 * Componente reutilizable para mostrar un loading centrado con texto opcional.
 */
export default function LoadingScreen({ text = "Cargando..." }) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.PRIMARY} />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }
      : {}),
  },
  loadingText: {
    marginTop: 18,
    fontSize: 18,
    color: Colors.PRIMARY,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
