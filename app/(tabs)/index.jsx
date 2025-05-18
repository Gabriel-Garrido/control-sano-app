import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator } from 'react-native'
import Colors from '../../constant/Colors'
import healthControls from '../../constant/Options'
import ControlForm from '../../components/ControlForm'
import { db, auth } from '../../config/FirebaseConfig'
import { query, where, getDocs, collection } from "firebase/firestore";
import { getLocalStorage, setLocalStorage } from '../../service/Storage'
import { useRouter } from 'expo-router'

export default function Index() {
  const [selectedControl, setSelectedControl] = useState(null)
  const [controlData, setControlData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState(null)
  const [babyList, setBabyList] = useState([])
  const [selectedBabyId, setSelectedBabyId] = useState(null)
  const [babySelectorVisible, setBabySelectorVisible] = useState(true)
  const [babyLoading, setBabyLoading] = useState(true)
  const [doneControls, setDoneControls] = useState({})
  const router = useRouter()

  // Cargar usuario y bebés al iniciar
  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserEmail(user.email)
    loadBabies(user?.email)
  }, [])

  // Cargar babyId desde localStorage
  useEffect(() => {
    const loadSelectedBaby = async () => {
      const id = await getLocalStorage('selectedBabyId')
      if (id) {
        setSelectedBabyId(id)
        setBabySelectorVisible(false)
      }
    }
    loadSelectedBaby()
  }, [babyList.length])

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

  // Cargar controles realizados para el bebé seleccionado
  useEffect(() => {
    const fetchDoneControls = async () => {
      if (!userEmail || !selectedBabyId) {
        setDoneControls({})
        return
      }
      const q = query(
        collection(db, 'controls'),
        where('userEmail', '==', userEmail),
        where('babyId', '==', selectedBabyId)
      )
      const querySnapshot = await getDocs(q)
      const done = {}
      querySnapshot.forEach(doc => {
        done[doc.data().controlType] = {
          date: doc.data().date,
          id: doc.id
        }
      })
      setDoneControls(done)
    }
    fetchDoneControls()
  }, [userEmail, selectedBabyId, controlData])

  // Seleccionar bebé y guardar en localStorage
  const handleSelectBaby = async (babyId) => {
    setSelectedBabyId(babyId)
    await setLocalStorage('selectedBabyId', babyId)
    setBabySelectorVisible(false)
  }

  // Mostrar selector de bebés si no hay uno seleccionado
  if (babySelectorVisible) {
    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Selecciona un bebé</Text>
        {babyLoading ? (
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        ) : babyList.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <Text style={styles.noBabyText}>No hay bebés registrados.</Text>
            <TouchableOpacity
              style={styles.addBabyBtn}
              onPress={() => router.push('/(tabs)/Profile')}
            >
              <Text style={styles.addBabyBtnText}>Agregar información de bebé</Text>
            </TouchableOpacity>
          </View>
        ) : (
          babyList.map(baby => (
            <TouchableOpacity
              key={baby.id}
              style={styles.babyBtn}
              onPress={() => handleSelectBaby(baby.id)}
            >
              <Text style={styles.babyBtnText}>
                {baby.firstName} {baby.lastName ? baby.lastName : ""}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    )
  }

  // Buscar datos de control para el bebé seleccionado
  const handleSelectControl = async (control) => {
    setLoading(true)
    setSelectedControl(control)
    setControlData(null)
    if (!userEmail || !selectedBabyId) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'controls'),
      where('userEmail', '==', userEmail),
      where('babyId', '==', selectedBabyId),
      where('controlType', '==', control.label)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setControlData({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() })
    }
    setLoading(false)
  }

  const handleCloseModal = () => {
    setSelectedControl(null)
    setControlData(null)
  }

  const handleFormSaved = () => {
    handleSelectControl(selectedControl)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Controles de niño sano</Text>
      {healthControls.map((item, idx) => {
        const done = doneControls[item.label]
        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.controlBtn,
              done && styles.controlBtnDone
            ]}
            activeOpacity={0.8}
            onPress={() => handleSelectControl(item)}
          >
            <View style={styles.textRow}>
              <Text style={styles.controlText}>{item.label}</Text>
              <Text style={styles.professionalText}>{item.professional}</Text>
              {done && (
                <View style={styles.doneTag}>
                  <Text style={styles.doneTagText}>
                    Realizado {done.date ? `el ${new Date(done.date).toLocaleDateString("es-CL")}` : ""}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )
      })}
      <Modal visible={!!selectedControl} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCloseModal}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
          ) : (
            <ControlForm
              control={selectedControl}
              controlData={controlData}
              onSaved={handleFormSaved}
              onClose={handleCloseModal}
              userEmail={userEmail}
              babyId={selectedBabyId}
            />
          )}
        </View>
      </Modal>
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
  controlBtnDone: {
    backgroundColor: "#e6f7e6",
    borderLeftColor: "#2e7d32",
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
  doneTag: {
    marginTop: 8,
    backgroundColor: "#2e7d32",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  doneTagText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    paddingTop: 40,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  closeBtnText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
  },
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
    backgroundColor: Colors.PRIMARY,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: 220,
  },
  addBabyBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
    textAlign: "center",
  },
});