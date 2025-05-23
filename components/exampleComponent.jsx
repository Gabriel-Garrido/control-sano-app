import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constant/Colors";

/**
 * Selector de bebés: muestra todos los bebés del usuario y permite seleccionar o agregar uno nuevo.
 */
export default function SelectBaby({
  babyList = [],
  loading = false,
  onSelect,
  onAddBaby,
}) {
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Selecciona un bebé</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : babyList.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 30 }}>
          <Text style={styles.noBabyText}>No hay bebés registrados.</Text>
          <TouchableOpacity
            style={styles.addBabyBtn}
            onPress={onAddBaby}
            accessibilityLabel="Agregar información de bebé"
            activeOpacity={0.8}
          >
            <Text style={styles.addBabyBtnText}>
              + Agregar información de bebé
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {babyList.map((baby) => (
            <TouchableOpacity
              key={baby.id}
              style={styles.babyBtn}
              onPress={() => onSelect(baby.id)}
              accessibilityLabel={`Seleccionar bebé ${baby.firstName} ${
                baby.lastName || ""
              }`}
              activeOpacity={0.8}
            >
              <Text style={styles.babyBtnText}>
                {baby.firstName} {baby.lastName ? baby.lastName : ""}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addBabyBtn, { marginTop: 24 }]}
            onPress={onAddBaby}
            accessibilityLabel="Agregar nuevo bebé"
            activeOpacity={0.8}
          >
            <Text style={styles.addBabyBtnText}>+ Agregar nuevo bebé</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  selectorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 24,
    textAlign: "center",
  },
  babyBtn: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: 220,
    alignItems: "center",
    elevation: 2,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }
      : {}),
  },
  babyBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  noBabyText: {
    color: Colors.DARK_GRAY,
    fontSize: 17,
    marginBottom: 18,
    textAlign: "center",
  },
  addBabyBtn: {
    backgroundColor: "#fff",
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: 220,
    elevation: 1,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 4px rgba(0,0,0,0.04)" }
      : {}),
  },
  addBabyBtnText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
