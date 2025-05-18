import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import Colors from '../../constant/Colors'
import healthControls from '../../constant/Options'

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Controles de niño sano</Text>
      {healthControls.map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.controlBtn} activeOpacity={0.8}>
          <View style={styles.textRow}>
            <Text style={styles.controlText}>{item.label}</Text>
            <Text style={styles.professionalText}>{item.professional}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f5f7fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },
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
});