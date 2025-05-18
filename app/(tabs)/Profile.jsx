import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { db, auth } from '../../config/FirebaseConfig'
import BabyInfoForm from '../../components/babyInfoForm'
import { query, where, getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Colors from '../../constant/Colors'
import { calculateAge, dateToLocaleString } from '../../utils/dateUtils'
import { getLocalStorage, setLocalStorage } from '../../service/Storage'
import { useRouter } from 'expo-router'
import SelectBaby from '../../components/selectBaby'

export default function Profile() {
  const [babyInfo, setBabyInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)
  const [babyList, setBabyList] = useState([])
  const [selectedBabyId, setSelectedBabyId] = useState(null)
  const [babySelectorVisible, setBabySelectorVisible] = useState(true)
  const [babyLoading, setBabyLoading] = useState(true)
  const router = useRouter()

  // Cargar usuario y bebés al iniciar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        loadBabies(firebaseUser.email)
      } else {
        setBabyList([])
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // Cargar babyId desde localStorage y setear babyInfo
  useEffect(() => {
    const loadSelectedBaby = async () => {
      const id = await getLocalStorage('selectedBabyId')
      setSelectedBabyId(id)
      if (id && babyList.length > 0) {
        const baby = babyList.find(b => b.id === id)
        if (baby) {
          setBabyInfo(baby)
          setBabySelectorVisible(false)
          setLoading(false)
        } else {
          setBabyInfo(null)
          setBabySelectorVisible(true)
        }
      } else {
        setBabyInfo(null)
        setBabySelectorVisible(true)
      }
    }
    loadSelectedBaby()
  }, [babyList])

  // Cargar lista de bebés del usuario
  const loadBabies = async (email) => {
    setBabyLoading(true)
    if (!email) {
      setBabyList([])
      setBabyLoading(false)
      return
    }
    const q = query(collection(db, "baby"), where("userEmail", "==", email))
    const querySnapshot = await getDocs(q)
    const babies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setBabyList(babies)
    setBabyLoading(false)
  }

  // Seleccionar bebé y guardar en localStorage
  const handleSelectBaby = async (babyId) => {
    setSelectedBabyId(babyId)
    await setLocalStorage('selectedBabyId', babyId)
    const baby = babyList.find(b => b.id === babyId)
    setBabyInfo(baby)
    setBabySelectorVisible(false)
    setLoading(false)
  }

  // Cambiar de bebé
  const handleChangeBaby = () => {
    setBabySelectorVisible(true)
  }

  // Si no hay bebés seleccionados, mostrar selector modularizado
  if (babySelectorVisible) {
    return (
      <>
        <SelectBaby
          babyList={babyList}
          loading={babyLoading}
          onSelect={handleSelectBaby}
          onAddBaby={() => setShowForm(true)}
        />
        {showForm && (
          <View style={styles.formWrapper}>
            <BabyInfoForm initialData={null} onClose={() => {
              setShowForm(false)
              if (user) loadBabies(user.email)
            }} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowForm(false)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    )
  }

  // Mostrar loading si está cargando info del bebé seleccionado
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
        <BabyInfoForm
          initialData={babyInfo}
          onClose={() => {
            setShowForm(false)
            if (user) loadBabies(user.email)
          }}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowForm(false)}>
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
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.editBtnText}>Editar información</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeBabyBtn} onPress={handleChangeBaby}>
            <Text style={styles.changeBabyBtnText}>Cambiar de bebé</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.noInfo}>No hay información del bebé.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
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
  changeBabyBtn: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    padding: 12,
  },
  changeBabyBtnText: {
    color: Colors.PRIMARY,
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
  },
});