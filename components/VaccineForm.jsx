import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constant/Colors";
import DateSelector from "./DateSelector";

/**
 * Formulario para registrar o editar una vacuna.
 */
export default function VaccineForm({
  visible,
  onClose,
  vaccine,
  onSave,
  initialData,
}) {
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [center, setCenter] = useState(initialData?.center || "");

  useEffect(() => {
    setDate(initialData?.date ? new Date(initialData.date) : new Date());
    setCenter(initialData?.center || "");
  }, [initialData, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Registrar vacuna: {vaccine?.name}
          </Text>
          <DateSelector
            label="Fecha de administración"
            value={date}
            onChange={setDate}
          />
          <Text style={styles.label}>Centro de salud</Text>
          <TextInput
            style={styles.input}
            value={center}
            onChangeText={setCenter}
            placeholder="Ingrese el centro de salud"
            placeholderTextColor={Colors.GRAY}
            autoCapitalize="words"
            maxLength={40}
          />
          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={[styles.saveBtn, { flex: 1, marginRight: 8 }]}
              onPress={() => onSave({ date, center })}
              disabled={!center}
            >
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelBtn, { flex: 1 }]}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    margin: 24,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 8px rgba(0,0,0,0.12)" }
      : {}),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 18,
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    color: Colors.DARK_GRAY,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY_BORDER || "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#f8f8f8",
    color: "#222",
  },
  modalBtnRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  saveBtn: {
    backgroundColor: Colors.PRIMARY,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: "#fff",
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    padding: 14,
  },
  cancelBtnText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
  },
});
