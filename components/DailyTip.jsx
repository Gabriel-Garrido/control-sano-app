import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../constant/Colors";
import { getAgeInDays } from "../utils/dateUtils";

/**
 * Componente que muestra el consejo diario según la edad del bebé en días.
 * Busca el consejo en el archivo JSON de recomendaciones.
 */
export default function DailyTip({ birthDate }) {
  const [tip, setTip] = useState(null);
  const [ageInDays, setAgeInDays] = useState(null);

  useEffect(() => {
    if (!birthDate) return;
    // Calcular la edad en días usando la función utilitaria
    const days = getAgeInDays(birthDate);
    setAgeInDays(days);

    // Cargar el JSON de recomendaciones de manera dinámica
    import("../monthly-recommendation/recom-1.json")
      .then((data) => {
        // Buscar el consejo correspondiente al día
        const found = data.tips.find((t) => t.day === days);
        setTip(found || null);
      })
      .catch(() => {
        setTip(null);
      });
  }, [birthDate]);

  if (!birthDate) {
    return null;
  }

  return (
    <View style={styles.tipContainer}>
      <Text style={styles.tipTitle}>Consejo del día {ageInDays ? `(Día ${ageInDays})` : ""}</Text>
      {tip ? (
        <>
          <Text style={styles.tipSubtitle}>{tip.title}</Text>
          <Text style={styles.tipText}>{tip.text}</Text>
        </>
      ) : (
        <Text style={styles.tipText}>No hay consejo disponible para hoy.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tipContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginVertical: 12,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 6,
    textAlign: "left",
  },
  tipSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.DARK_GRAY,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 15,
    color: "#222",
    marginTop: 2,
    lineHeight: 21,
    textAlign: "left",
  },
});