import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { db, auth } from '../../config/FirebaseConfig'
import BabyInfoForm from '../../components/babyInfoForm'
import { query, where, getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Colors from '../../constant/Colors'
import { calculateAge, dateToLocaleString } from '../../utils/dateUtils'

export default function Profile() {
  const [babyInfo, setBabyInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        fetchBabyInfo(firebaseUser)
      } else {
        setBabyInfo(null)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchBabyInfo = async (firebaseUser) => {
    setLoading(true);
    try {
      if (!firebaseUser) {
        setBabyInfo(null)
        setLoading(false)
        return
      }
      const q = query(
        collection(db, 'baby'),
        where('userEmail', '==', firebaseUser.email)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setBabyInfo(data);
      } else {
        setBabyInfo(null);
      }
    } catch (error) {
      setBabyInfo(null)
    }
    setLoading(false);
  };

  const handleShowForm = () => setShowForm(true)
  const handleFormClose = () => {
    setShowForm(false)
    if (user) fetchBabyInfo(user)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    )
  }

  if (showForm) {
    return (
      <View style={styles.formWrapper}>
        <BabyInfoForm initialData={babyInfo} onClose={handleFormClose} />
        <TouchableOpacity style={styles.closeBtn} onPress={handleFormClose}>
          <Text style={styles.closeBtnText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Perfil</Text>
      {babyInfo ? (
        <View style={styles.card}>
          <Text style={styles.title}>Información del bebé</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{babyInfo.firstName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Apellido:</Text>
            <Text style={styles.value}>{babyInfo.lastName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de nacimiento:</Text>
            <Text style={styles.value}>
              {dateToLocaleString(babyInfo.birthDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>
              {calculateAge(babyInfo.birthDate)}
            </Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleShowForm}>
            <Text style={styles.editBtnText}>Editar información</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.noInfo}>No hay información del bebé.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleShowForm}>
            <Text style={styles.addBtnText}>Agregar información</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f5f7fa",
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 18,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    color: Colors.DARK_GRAY,
    fontSize: 16,
  },
  value: {
    color: "#222",
    fontSize: 16,
    fontWeight: "500",
  },
  editBtn: {
    marginTop: 18,
    backgroundColor: Colors.PRIMARY,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  addBtn: {
    marginTop: 10,
    backgroundColor: Colors.PRIMARY,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  noInfo: {
    color: Colors.DARK_GRAY,
    fontSize: 17,
    textAlign: "center",
    marginBottom: 10,
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  closeBtn: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeBtnText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: Colors.DARK_GRAY,
    fontSize: 16,
    fontWeight: "500"
  }
});