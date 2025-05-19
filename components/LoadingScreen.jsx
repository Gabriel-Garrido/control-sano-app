import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
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