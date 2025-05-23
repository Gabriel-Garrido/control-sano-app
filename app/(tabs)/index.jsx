import { useFocusEffect, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BabyHeader from "../../components/BabyHeader";
import BabyInfoForm from "../../components/babyInfoForm";
import ControlForm from "../../components/ControlForm";
import ControlsList from "../../components/ControlsList";
import DailyTip from "../../components/DailyTip";
import LoadingScreen from "../../components/LoadingScreen";
import SelectBaby from "../../components/selectBaby";
import { auth, db } from "../../config/FirebaseConfig";
import Colors from "../../constant/Colors";
import healthControls from "../../constant/Options";
import { getLocalStorage, setLocalStorage } from "../../service/Storage";

/**
 * Pantalla principal: muestra header, info del bebé, consejo diario y controles.
 * UX/UI mejorada para móviles: uso de SafeAreaView, espaciados, jerarquía visual y scroll fluido.
 */
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

  // Al cargar la app, verifica si hay un bebé seleccionado en localStorage
  useEffect(() => {
    const checkSelectedBaby = async () => {
      const id = await getLocalStorage("selectedBabyId");
      if (id) {
        setSelectedBabyId(id);
        setBabySelectorVisible(false);
      } else {
        setSelectedBabyId(null);
        setBabySelectorVisible(true);
      }
    };
    checkSelectedBaby();
  }, [babyList]);

  // Cargar babyInfo cuando cambia el selectedBabyId o la lista de bebés
  useEffect(() => {
    if (babyLoading) return;
    if (selectedBabyId && babyList.length > 0) {
      const baby = babyList.find((b) => b.id === selectedBabyId);
      setBabyInfo(baby);
      setInitializing(false);
    } else {
      setBabyInfo(null);
    }
  }, [selectedBabyId, babyList, babyLoading]);

  // Sincroniza el bebé seleccionado cada vez que la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      const syncSelectedBaby = async () => {
        const id = await getLocalStorage("selectedBabyId");
        setSelectedBabyId(id);

        // Si hay un id y usuario autenticado, obtener info actualizada de Firebase
        if (id && userEmail) {
          try {
            const q = query(
              collection(db, "baby"),
              where("userEmail", "==", userEmail),
              where("__name__", "==", id)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const baby = {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data(),
              };
              setBabyInfo(baby);
            }
          } catch (e) {
            // Si hay error, fallback a la lista local
            if (babyList.length > 0) {
              const baby = babyList.find((b) => b.id === id);
              setBabyInfo(baby);
            }
          }
        } else if (id && babyList.length > 0) {
          const baby = babyList.find((b) => b.id === id);
          setBabyInfo(baby);
        }
      };
      syncSelectedBaby();
    }, [babyList, userEmail])
  );

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
    setInitializing(true);
    setSelectedBabyId(babyId);
    await setLocalStorage("selectedBabyId", babyId);
    const baby = babyList.find((b) => b.id === babyId);
    setBabyInfo(baby);
    setBabySelectorVisible(false);
    setInitializing(false);
  };

  // Mostrar selector de bebés o formulario para crear bebé solo si NO hay bebé seleccionado
  if (babySelectorVisible && !selectedBabyId) {
    if (showForm) {
      return (
        <SafeAreaView style={styles.safeArea}>
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
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safeArea}>
        <SelectBaby
          babyList={babyList}
          loading={babyLoading}
          onSelect={handleSelectBaby}
          onAddBaby={() => setShowForm(true)}
        />
      </SafeAreaView>
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
    <SafeAreaView style={styles.safeArea}>
      {/* Scroll principal para el resto del contenido */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info del bebé seleccionada */}
        <View style={styles.section}>
          <BabyHeader baby={babyInfo} />
        </View>

        {/* Botón para cambiar de bebé */}
        <TouchableOpacity
          style={styles.changeBabyBtn}
          onPress={async () => {
            await setLocalStorage("selectedBabyId", null);
            setSelectedBabyId(null);
            setBabySelectorVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.changeBabyBtnText}>Cambiar de bebé</Text>
        </TouchableOpacity>

        {/* Consejo diario destacado */}
        <View style={styles.section}>
          <DailyTip birthDate={babyInfo?.birthDate} />
        </View>

        {/* Lista de controles de salud */}
        <View style={styles.section}>
          <ControlsList
            controls={healthControls}
            doneControls={doneControls}
            onSelect={handleSelectControl}
            loading={initializing || babyLoading}
          />
        </View>
      </ScrollView>

      {/* Modal para formulario de control */}
      <Modal
        visible={!!selectedControl}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleCloseModal}
            >
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
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Estilos mejorados para UX/UI móvil
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 18,
  },
  changeBabyBtn: {
    backgroundColor: "#fff",
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 22,
    alignSelf: "center",
    width: "80%",
    elevation: 1,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 4px rgba(0,0,0,0.04)" }
      : {}),
  },
  changeBabyBtnText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    paddingTop: Platform.OS === "android" ? 40 : 18,
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
