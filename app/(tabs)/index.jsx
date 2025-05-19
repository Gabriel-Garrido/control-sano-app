import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import Colors from "../../constant/Colors";
import healthControls from "../../constant/Options";
import ControlForm from "../../components/ControlForm";
import { db, auth } from "../../config/FirebaseConfig";
import { query, where, getDocs, collection } from "firebase/firestore";
import { getLocalStorage, setLocalStorage } from "../../service/Storage";
import { useRouter } from "expo-router";
import SelectBaby from "../../components/selectBaby";
import BabyHeader from "../../components/BabyHeader";
import ControlsList from "../../components/ControlsList";
import BabyInfoForm from "../../components/babyInfoForm";
import LoadingScreen from "../../components/LoadingScreen";
import { onAuthStateChanged } from "firebase/auth";
import DailyTip from "../../components/DailyTip";


export default function Index() {
  // Estados principales
  const [selectedControl, setSelectedControl] = useState(null);
  const [controlData, setControlData] = useState(null);
  const [loading, setLoading] = useState(false); // loading para controles
  const [userEmail, setUserEmail] = useState(null);
  const [babyList, setBabyList] = useState([]);
  const [selectedBabyId, setSelectedBabyId] = useState(null);
  const [babySelectorVisible, setBabySelectorVisible] = useState(true);
  const [babyLoading, setBabyLoading] = useState(true); // loading para bebés
  const [doneControls, setDoneControls] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [babyInfo, setBabyInfo] = useState(null);
  const [initializing, setInitializing] = useState(true); // loading global para la pantalla
  const router = useRouter();

  // Escuchar autenticación y cargar bebés solo cuando el usuario esté listo
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        loadBabies(user.email);
      } else {
        setUserEmail(null);
        setBabyList([]);
        setBabyLoading(false);
        setInitializing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cargar babyId desde localStorage y setear babyInfo
  useEffect(() => {
    // Si aún se están cargando los bebés, no hacer nada
    if (babyLoading) return;
    const loadSelectedBaby = async () => {
      setInitializing(true); // Mostrar loading mientras se determina el bebé seleccionado
      const id = await getLocalStorage("selectedBabyId");
      setSelectedBabyId(id);
      if (id && babyList.length > 0) {
        const baby = babyList.find((b) => b.id === id);
        setBabyInfo(baby);
      } else {
        setBabyInfo(null);
      }
      setInitializing(false); // Ocultar loading cuando termina
    };
    loadSelectedBaby();
  }, [babyList, babyLoading]);

  // Cargar lista de bebés del usuario
  const loadBabies = async (email) => {
    setBabyLoading(true);
    if (!email) {
      setBabyList([]);
      setBabyLoading(false);
      return;
    }
    const q = query(collection(db, "baby"), where("userEmail", "==", email));
    const querySnapshot = await getDocs(q);
    const babies = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setBabyList(babies);
    setBabyLoading(false);
  };

  // Cargar controles realizados para el bebé seleccionado
  useEffect(() => {
    // Si aún se está inicializando, no cargar controles
    if (initializing) return;
    const fetchDoneControls = async () => {
      if (!userEmail || !selectedBabyId) {
        setDoneControls({});
        return;
      }
      const q = query(
        collection(db, "controls"),
        where("userEmail", "==", userEmail),
        where("babyId", "==", selectedBabyId)
      );
      const querySnapshot = await getDocs(q);
      const done = {};
      querySnapshot.forEach((doc) => {
        done[doc.data().controlType] = {
          date: doc.data().date,
          id: doc.id,
        };
      });
      setDoneControls(done);
    };
    fetchDoneControls();
  }, [userEmail, selectedBabyId, controlData, initializing]);

  // Seleccionar bebé y guardar en localStorage
  const handleSelectBaby = async (babyId) => {
    setInitializing(true); // Mostrar loading mientras cambia el bebé seleccionado
    setSelectedBabyId(babyId);
    await setLocalStorage("selectedBabyId", babyId);
    const baby = babyList.find((b) => b.id === babyId);
    setBabyInfo(baby);
    setBabySelectorVisible(false);
    setInitializing(false); // Ocultar loading cuando termina
  };

  // Mostrar selector de bebés o formulario para crear bebé
  if (babySelectorVisible) {
    if (showForm) {
      // Mostrar solo el formulario para crear bebé
      return (
        <View style={styles.formWrapper}>
          <BabyInfoForm
            initialData={null}
            onClose={() => {
              setShowForm(false);
              if (userEmail) loadBabies(userEmail);
            }}
          />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowForm(false)}
          >
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // Mostrar selector de bebés SIEMPRE con la lista completa
    return (
      <SelectBaby
        babyList={babyList}
        loading={babyLoading}
        onSelect={handleSelectBaby}
        onAddBaby={() => setShowForm(true)}
      />
    );
  }

  // Mostrar loading global mientras se inicializa la pantalla o cambia de bebé
  if (initializing) {
    return <LoadingScreen text="Cargando información del bebé..." />;
  }

  // Buscar datos de control para el bebé seleccionado
  const handleSelectControl = async (control) => {
    setLoading(true);
    setSelectedControl(control);
    setControlData(null);
    if (!userEmail || !selectedBabyId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "controls"),
      where("userEmail", "==", userEmail),
      where("babyId", "==", selectedBabyId),
      where("controlType", "==", control.label)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setControlData({
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      });
    }
    setLoading(false);
  };

  // Cerrar modal de control
  const handleCloseModal = () => {
    setSelectedControl(null);
    setControlData(null);
  };

  // Al guardar un control, recargar controles realizados
  const handleFormSaved = () => {
    handleSelectControl(selectedControl);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Mostrar info del bebé seleccionado */}
      <BabyHeader baby={babyInfo} />
      {/* Botón para cambiar de bebé */}
      <DailyTip birthDate={babyInfo?.birthDate} />
      {/* Botón para cambiar de bebé */}
      <TouchableOpacity
        style={styles.changeBabyBtn}
        onPress={() => setBabySelectorVisible(true)}
      >
        <Text style={styles.changeBabyBtnText}>Cambiar de bebé</Text>
      </TouchableOpacity>
      {/* Lista de controles */}
      <ControlsList
        controls={healthControls}
        doneControls={doneControls}
        onSelect={handleSelectControl}
        loading={initializing || babyLoading}
      />
      {/* Modal para formulario de control */}
      <Modal
        visible={!!selectedControl}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCloseModal}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
          {loading ? (
            <LoadingScreen text="Cargando control..." />
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
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f5f7fa",
  },
  changeBabyBtn: {
    backgroundColor: "#fff",
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
    marginBottom: 18,
    alignSelf: "center",
    width: 180,
  },
  changeBabyBtnText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
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
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
});
