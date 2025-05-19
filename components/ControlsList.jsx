import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../constant/Colors";
import LoadingScreen from "./LoadingScreen";

/**
 * Lista de controles de salud para el bebé seleccionado.
 * Muestra un loading mientras se cargan los controles.
 */
export default function ControlsList({ controls, doneControls, onSelect, loading = false }) {
  if (loading) {
    // Mostrar loading mientras se cargan los controles
    return <LoadingScreen text="Cargando controles..." />;
  }

  return (
    <View>
      {controls.map((item, idx) => {
        const done = doneControls[item.label];
        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.controlBtn,
              done && styles.controlBtnDone
            ]}
            activeOpacity={0.8}
            onPress={() => onSelect(item)}
          >
            <View style={styles.textRow}>
              <Text style={styles.controlText}>{item.label}</Text>
              <Text style={styles.professionalText}>{item.professional}</Text>
              {done && (
                <View style={styles.doneTag}>
                  <Text style={styles.doneTagText}>
                    Realizado {done.date ? `el ${new Date(done.date).toLocaleDateString("es-CL")}` : ""}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  controlBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    borderLeftWidth: 6,
    borderLeftColor: Colors.PRIMARY,
  },
  controlBtnDone: {
    backgroundColor: "#e6f7e6",
    borderLeftColor: "#2e7d32",
  },
  textRow: {
    flexDirection: "column",
  },
  controlText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  professionalText: {
    fontSize: 15,
    color: Colors.DARK_GRAY,
    fontWeight: "500",
  },
  doneTag: {
    marginTop: 8,
    backgroundColor: "#2e7d32",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  doneTagText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});