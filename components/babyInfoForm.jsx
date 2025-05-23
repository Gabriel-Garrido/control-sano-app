import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../config/FirebaseConfig";
import Colors from "../constant/Colors";
import { getLocalStorage, setLocalStorage } from "../service/Storage";
import DateSelector from "./DateSelector";

/**
 * Formulario para agregar o editar información de un bebé.
 * Si initialData es null, crea un nuevo bebé.
 * Si initialData tiene datos, edita el bebé existente.
 */
export default function BabyInfoForm({ initialData, onClose }) {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [birthDate, setBirthDate] = useState(
    initialData?.birthDate
      ? initialData.birthDate.toDate
        ? initialData.birthDate.toDate()
        : new Date(
            initialData.birthDate.seconds
              ? initialData.birthDate.seconds * 1000
              : initialData.birthDate
          )
      : new Date()
  );
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setFirstName(initialData?.firstName || "");
    setLastName(initialData?.lastName || "");
    setBirthDate(
      initialData?.birthDate
        ? initialData.birthDate.toDate
          ? initialData.birthDate.toDate()
          : new Date(
              initialData.birthDate.seconds
                ? initialData.birthDate.seconds * 1000
                : initialData.birthDate
            )
        : new Date()
    );
  }, [initialData]);

  // Maneja el guardado (crear o editar)
  const handleSubmit = async () => {
    if (!firstName) {
      setFeedback({ type: "error", message: "El nombre es obligatorio" });
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setFeedback({ type: "error", message: "No hay usuario autenticado" });
      return;
    }
    setLoading(true);
    try {
      if (initialData && initialData.id) {
        // Editar bebé existente
        await updateDoc(doc(db, "baby", initialData.id), {
          firstName,
          lastName,
          birthDate,
          userEmail: user.email,
        });
        setFeedback({
          type: "success",
          message: "¡Información actualizada con éxito!",
        });
      } else {
        // Crear nuevo bebé
        await addDoc(collection(db, "baby"), {
          firstName,
          lastName,
          birthDate,
          userEmail: user.email,
        });
        setFeedback({
          type: "success",
          message: "¡Información guardada con éxito!",
        });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Error al guardar: " + error.message,
      });
      console.error("addDoc/updateDoc error:", error);
    }
    setLoading(false);
  };

  // Confirmación multiplataforma para eliminar
  const confirmDelete = () => {
    if (Platform.OS === "web") {
      // Web: usar window.confirm
      if (
        window.confirm(
          "¿Estás seguro de que deseas eliminar este bebé? Esta acción no se puede deshacer."
        )
      ) {
        handleDelete();
      }
    } else {
      // Móvil: usar Alert
      import("react-native").then(({ Alert }) => {
        Alert.alert(
          "Eliminar bebé",
          "¿Estás seguro de que deseas eliminar este bebé? Esta acción no se puede deshacer.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Eliminar",
              style: "destructive",
              onPress: handleDelete,
            },
          ]
        );
      });
    }
  };

  // Maneja la eliminación del bebé (Firebase y localStorage)
  const handleDelete = async () => {
    setLoading(true);
    let success = false;
    try {
      // Eliminar de Firebase
      await deleteDoc(doc(db, "baby", initialData.id));
      // Eliminar de localStorage si es el seleccionado
      const selectedId = await getLocalStorage("selectedBabyId");
      if (selectedId === initialData.id) {
        await setLocalStorage("selectedBabyId", null);
      }
      setFeedback({ type: "success", message: "¡Bebé eliminado con éxito!" });
      success = true;
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Error al eliminar: " + error.message,
      });
      console.error("deleteDoc error:", error);
    }
    setLoading(false);
    setTimeout(() => {
      if (success && onClose) onClose();
    }, 1200);
  };

  if (feedback) {
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.feedback,
            feedback.type === "success" ? styles.success : styles.error,
          ]}
        >
          {feedback.message}
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            feedback.type === "success"
              ? styles.buttonSuccess
              : styles.buttonError,
          ]}
          onPress={() => {
            setFeedback(null);
            if (feedback.type === "success" && onClose) onClose();
          }}
        >
          <Text style={styles.buttonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.avoiding}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Información del bebé</Text>
        <Text style={styles.label}>
          Nombre <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Nombre"
          placeholderTextColor={Colors.GRAY}
          autoCapitalize="words"
          autoFocus
          maxLength={30}
        />
        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Apellido"
          placeholderTextColor={Colors.GRAY}
          autoCapitalize="words"
          maxLength={30}
        />
        <DateSelector
          label="Fecha de nacimiento"
          value={birthDate}
          onChange={setBirthDate}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel="Guardar información del bebé"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>
        {/* Botón para eliminar solo si es edición */}
        {initialData && initialData.id && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={confirmDelete}
            disabled={loading}
            accessibilityLabel="Eliminar bebé"
          >
            <Text style={styles.buttonText}>Eliminar bebé</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.note}>
          <Text style={styles.required}>*</Text> Campo obligatorio
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avoiding: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 18,
    elevation: 3,
    margin: 10,
    gap: 2,
    // Quitar shadowColor, shadowOpacity, shadowRadius
    // boxShadow solo para web
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 12px rgba(0,0,0,0.10)" }
      : {}),
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
    color: Colors.PRIMARY,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
    color: Colors.DARK_GRAY,
    fontSize: 16,
  },
  required: {
    color: "#c62828",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY_BORDER,
    borderRadius: 10,
    padding: 14,
    marginTop: 5,
    marginBottom: 10,
    fontSize: 17,
    backgroundColor: "#f8f8f8",
    color: "#222",
  },
  button: {
    padding: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    marginTop: 24,
    alignItems: "center",
    // Quitar shadowColor, shadowOpacity, shadowRadius
    elevation: 2,
    // boxShadow solo para web
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 4px rgba(0,0,0,0.12)" }
      : {}),
    transitionDuration: "150ms",
  },
  buttonDisabled: {
    backgroundColor: Colors.GRAY,
  },
  buttonSuccess: {
    backgroundColor: "#2e7d32",
  },
  buttonError: {
    backgroundColor: "#c62828",
  },
  deleteButton: {
    backgroundColor: "#c62828",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  note: {
    marginTop: 12,
    color: Colors.DARK_GRAY,
    fontSize: 13,
    textAlign: "right",
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
