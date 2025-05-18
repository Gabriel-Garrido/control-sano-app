import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { db } from "../config/FirebaseConfig";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import Colors from "../constant/Colors";
import healthControls from "../constant/Options";

export default function ControlForm({ control, controlData, onSaved, onClose, userEmail, babyId }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (controlData && controlData.formData) {
      setForm(controlData.formData);
    } else {
      setForm({});
    }
  }, [controlData]);

  if (!control) return null;

  const controlOption = healthControls.find(c => c.label === control.label);
  const fields = controlOption?.fields || [
    { key: "observaciones", label: "Observaciones", type: "text" }
  ];

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    if (!userEmail || !babyId) {
      setFeedback({
        type: "error",
        message: "No se puede guardar el control: falta información del usuario o del bebé. Por favor, asegúrate de haber ingresado los datos del bebé y haber iniciado sesión."
      });
      return;
    }
    setSaving(true);
    try {
      const now = new Date();
      const dataToSave = {
        userEmail,
        babyId,
        controlType: control.label,
        date: now.toISOString(),
        professional: control.professional,
        formData: form,
        updatedAt: now.toISOString(),
        ...(controlData ? {} : { createdAt: now.toISOString() }),
      };
      if (controlData && controlData.id) {
        await updateDoc(doc(db, "controls", controlData.id), dataToSave);
      } else {
        await addDoc(collection(db, "controls"), dataToSave);
      }
      setFeedback({ type: "success", message: "¡Control guardado correctamente!" });
      if (onSaved) onSaved();
    } catch (e) {
      setFeedback({ type: "error", message: "No se pudo guardar el control" });
    }
    setSaving(false);
  };

  if (feedback) {
    return (
      <View style={styles.container}>
        <Text style={[
          styles.feedback,
          feedback.type === "success" ? styles.success : styles.error
        ]}>
          {feedback.message}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, feedback.type === "success" ? styles.buttonSuccess : styles.buttonError]}
          onPress={() => {
            setFeedback(null);
            if (feedback.type === "success" && onClose) onClose();
          }}
        >
          <Text style={styles.saveBtnText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text style={styles.title}>{control.label}</Text>
      <Text style={styles.professional}>{control.professional}</Text>
      {controlData ? (
        <Text style={styles.status}>Control realizado el {new Date(controlData.date).toLocaleDateString("es-ES")}</Text>
      ) : (
        <Text style={styles.status}>Control no realizado aún</Text>
      )}
      <View style={styles.form}>
        {fields.map(field => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={form[field.key] ? String(form[field.key]) : ""}
              onChangeText={value => handleChange(field.key, field.type === "number" ? value.replace(/[^0-9.]/g, "") : value)}
              keyboardType={field.type === "number" ? "numeric" : "default"}
              placeholder={field.label}
              editable={!saving}
            />
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.saveBtn, saving && { backgroundColor: Colors.GRAY }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{controlData ? "Editar" : "Guardar"}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.cancelBtnText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    margin: 10,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 6,
    textAlign: "center",
  },
  professional: {
    fontSize: 16,
    color: Colors.DARK_GRAY,
    textAlign: "center",
    marginBottom: 10,
  },
  status: {
    fontSize: 15,
    color: Colors.DARK_GRAY,
    textAlign: "center",
    marginBottom: 16,
  },
  form: {
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    color: Colors.DARK_GRAY,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY_BORDER,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    color: "#222",
  },
  saveBtn: {
    padding: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonSuccess: {
    backgroundColor: "#2e7d32",
  },
  buttonError: {
    backgroundColor: "#c62828",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  cancelBtn: {
    padding: 12,
    backgroundColor: "#fff",
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
  },
  feedback: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 32,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  success: {
    color: "#2e7d32",
  },
  error: {
    color: "#c62828",
  },
});