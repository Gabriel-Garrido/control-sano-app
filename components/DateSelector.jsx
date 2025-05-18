import React, { useRef } from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Selector de fecha multiplataforma (web y móvil)
 * Props:
 *  - value: Date
 *  - onChange: (date: Date) => void
 *  - label: string (opcional)
 */
export default function DateSelector({ value, onChange, label }) {
  const inputRef = useRef();

  if (Platform.OS === "web") {
    // Web: usar input nativo HTML
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <input
          ref={inputRef}
          type="date"
          style={{
            ...styles.dateInput,
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #E5E7EB",
            background: "#f8f8f8",
            color: "#222",
            outline: "none",
          }}
          value={value.toISOString().substring(0, 10)}
          onChange={e => {
            const date = new Date(e.target.value + "T00:00:00");
            if (!isNaN(date)) onChange(date);
          }}
        />
      </View>
    );
  }

  // Móvil: usar DateTimePicker
  const [show, setShow] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dateText}>{value.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShow(false);
            if (selectedDate) onChange(selectedDate);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  label: { fontWeight: "bold", marginBottom: 4, color: "#333" },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
  },
  dateText: { color: "#333" },
});