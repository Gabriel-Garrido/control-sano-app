import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Colors from "../constant/Colors";
import { getAgeInDays } from "../utils/dateUtils";

/**
 * Componente que muestra el consejo diario según la edad del bebé en días.
 * 
 * prompt para chatgpt : 
 * ""realiza una investigacion sobre los cuidados y recomendaciones de un bebe de 12 meses , busca informacion en lugares confiables de chile . luego continuemos los dias del json anterior , un archivo json que tenga un consejo diario para todos los dias del mes 12 de un bebe , cada consejo debe tener un titulo y un texto, esto se mostrara en una app de control de niño, por lo que el texto del consejo debe ser tierno y bien informativo, utilizando terminos cientificos explicados con palabras simples. debe ser de aprox 10 lineas cada consejo. la respuesta debe ser solo en json en este formato, con esos keys ''{
      "day": 35,
      "title": "Escuchando y aprendiendo",
      "text": "Tu capacidad auditiva mejora cada día. Hablarte, cantarte y responder a tus balbuceos estimula tu desarrollo del lenguaje. Estas interacciones tempranas son la base para futuras habilidades comunicativas."
    }'' el json debe tener los siguientes 30 días del json anterior, no incluyas consejos que digan cuanta edad cumple"""
 * 
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
      <Text style={styles.tipTitle}>
        Consejo del día {ageInDays ? `(Día ${ageInDays})` : ""}
      </Text>
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
    elevation: 2,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }
      : {}),
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
