import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../constant/Colors";

// Calcula la edad a partir de la fecha de nacimiento
function getAge(birthDate) {
  if (!birthDate) return "";
  let date;
  if (typeof birthDate.toDate === "function") {
    date = birthDate.toDate();
  } else if (birthDate.seconds) {
    date = new Date(birthDate.seconds * 1000);
  } else {
    date = new Date(birthDate);
  }
  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  let months = today.getMonth() - date.getMonth();
  let days = today.getDate() - date.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  let ageStr = "";
  if (years > 0) ageStr += `${years} año${years > 1 ? "s" : ""}`;
  if (months > 0) ageStr += `${ageStr ? ", " : ""}${months} mes${months > 1 ? "es" : ""}`;
  if (days > 0 || (!years && !months)) ageStr += `${ageStr ? " y " : ""}${days} día${days !== 1 ? "s" : ""}`;
  return ageStr;
}

export default function BabyHeader({ baby }) {
  if (!baby) return null;
  return (
    <View style={styles.babyHeader}>
      <Text style={styles.babyName}>{baby.firstName} {baby.lastName}</Text>
      <Text style={styles.babyAge}>Edad: {getAge(baby.birthDate)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  babyHeader: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  babyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  babyAge: {
    fontSize: 16,
    color: Colors.DARK_GRAY,
    marginTop: 2,
    marginBottom: 8,
  },
});