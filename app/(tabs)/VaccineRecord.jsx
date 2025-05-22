import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { db, auth } from "../../config/FirebaseConfig";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { getLocalStorage, setLocalStorage } from "../../service/Storage";
import Colors from "../../constant/Colors";
import LoadingScreen from "../../components/LoadingScreen";
import VaccineForm from "../../components/VaccineForm";
import Header from "../../components/Header";
import SelectBaby from "../../components/selectBaby";
import BabyInfoForm from "../../components/babyInfoForm";
import BabyHeader from "../../components/BabyHeader";
import { calculateAge } from "../../utils/dateUtils";
import { useFocusEffect } from "expo-router";

// Lista de vacunas PNI Chile por edad
const VACCINES = [
  { id: "bcg", name: "BCG", age: "Recién nacido" },
  { id: "hepb1", name: "Hepatitis B 1° dosis", age: "Recién nacido" },
  { id: "hexavalente1", name: "Hexavalente 1° dosis", age: "2 meses" },
  { id: "neumococica1", name: "Neumocócica conjugada 1° dosis", age: "2 meses" },
  { id: "rotavirus1", name: "Rotavirus 1° dosis", age: "2 meses" },
  { id: "hexavalente2", name: "Hexavalente 2° dosis", age: "4 meses" },
  { id: "neumococica2", name: "Neumocócica conjugada 2° dosis", age: "4 meses" },
  { id: "rotavirus2", name: "Rotavirus 2° dosis", age: "4 meses" },
  { id: "hexavalente3", name: "Hexavalente 3° dosis", age: "6 meses" },
  { id: "influenza1", name: "Influenza 1° dosis", age: "6 meses" },
  { id: "influenza2", name: "Influenza 2° dosis", age: "7 meses" },
  { id: "neumococicaRef", name: "Neumocócica refuerzo", age: "12 meses" },
  { id: "meningococica", name: "Meningocócica", age: "12 meses" },
  { id: "tresvirica", name: "Tres vírica (SRP)", age: "12 meses" },
  { id: "hexavalenteRef", name: "Hexavalente refuerzo", age: "18 meses" },
  { id: "varicela", name: "Varicela", age: "18 meses" },
  { id: "dtpa", name: "DTPa", age: "4 años" },
];

export default function VaccineRecord() {
  const [babyId, setBabyId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState({});
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Para selección de bebé
  const [babyList, setBabyList] = useState([]);
  const [babySelectorVisible, setBabySelectorVisible] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [babyLoading, setBabyLoading] = useState(true);
  const [babyInfo, setBabyInfo] = useState(null);

  // Cargar usuario y bebés al iniciar
  useEffect(() => {
    const fetchUserAndBabies = async () => {
      const user = auth.currentUser;
      setUserEmail(user?.email || null);
      if (user?.email) {
        await loadBabies(user.email);
      } else {
        setBabyList([]);
        setBabyLoading(false);
      }
    };
    fetchUserAndBabies();
  }, []);

  // useFocusEffect para actualizar info del bebé seleccionado al cambiar de tab/screen
  useFocusEffect(
    React.useCallback(() => {
      const syncSelectedBaby = async () => {
        const id = await getLocalStorage("selectedBabyId");
        setBabyId(id);
        if (id && userEmail) {
          // Busca el bebé actualizado en Firebase
          const q = query(
            collection(db, "baby"),
            where("userEmail", "==", userEmail),
            where("__name__", "==", id)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const baby = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            setBabyInfo(baby);
            setBabySelectorVisible(false);
          } else if (babyList.length > 0) {
            const baby = babyList.find((b) => b.id === id);
            setBabyInfo(baby);
            setBabySelectorVisible(false);
          } else {
            setBabyInfo(null);
            setBabySelectorVisible(true);
          }
        } else if (id && babyList.length > 0) {
          const baby = babyList.find((b) => b.id === id);
          setBabyInfo(baby);
          setBabySelectorVisible(false);
        } else {
          setBabyInfo(null);
          setBabySelectorVisible(true);
        }
      };
      syncSelectedBaby();
    }, [babyList, userEmail])
  );

  // Sincroniza el bebé seleccionado cada vez que cambia la lista de bebés (para primer render)
  useEffect(() => {
    const syncSelectedBaby = async () => {
      const id = await getLocalStorage("selectedBabyId");
      setBabyId(id);
      if (id && babyList.length > 0) {
        const baby = babyList.find((b) => b.id === id);
        setBabyInfo(baby);
        setBabySelectorVisible(false);
      } else {
        setBabyInfo(null);
        setBabySelectorVisible(true);
      }
    };
    syncSelectedBaby();
  }, [babyList]);

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

  // Cargar registros de vacunas del bebé seleccionado
  useEffect(() => {
    const fetchRecords = async () => {
      if (!userEmail || !babyId) return;
      setLoading(true);
      const q = query(
        collection(db, "vaccineRecords"),
        where("userEmail", "==", userEmail),
        where("babyId", "==", babyId)
      );
      const querySnapshot = await getDocs(q);
      const recs = {};
      querySnapshot.forEach((doc) => {
        recs[doc.data().vaccineId] = { ...doc.data(), id: doc.id };
      });
      setRecords(recs);
      setLoading(false);
    };
    fetchRecords();
  }, [userEmail, babyId, modalVisible]);

  // Guardar o actualizar registro de vacuna
  const handleSaveVaccine = async (data) => {
    setLoading(true);
    const vaccineId = selectedVaccine.id;
    const record = records[vaccineId];
    try {
      if (record) {
        // Actualizar
        await updateDoc(doc(db, "vaccineRecords", record.id), {
          ...record,
          date: data.date.toISOString(),
          center: data.center,
        });
      } else {
        // Nuevo registro
        await addDoc(collection(db, "vaccineRecords"), {
          userEmail,
          babyId,
          vaccineId,
          vaccineName: selectedVaccine.name,
          date: data.date.toISOString(),
          center: data.center,
        });
      }
    } catch (e) {
      alert("Error al guardar el registro de vacuna");
    }
    setModalVisible(false);
    setLoading(false);
  };

  // Seleccionar bebé y guardar en localStorage
  const handleSelectBaby = async (babyId) => {
    setBabyId(babyId);
    await setLocalStorage("selectedBabyId", babyId);
    const baby = babyList.find((b) => b.id === babyId);
    setBabyInfo(baby);
    setBabySelectorVisible(false);
  };

  // Mostrar selector de bebés o formulario para crear bebé solo si NO hay bebé seleccionado
  if (babySelectorVisible && !babyId) {
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

  if (loading) return <LoadingScreen text="Cargando vacunas..." />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mostrar info del bebé seleccionado */}
        {babyInfo && (
          <View style={styles.section}>
            <BabyHeader baby={babyInfo} />
          </View>
        )}
        <Text style={styles.header}>Registro de Vacunas</Text>
        {VACCINES.map((vaccine) => (
          <VaccineItem
            key={vaccine.id}
            vaccine={vaccine}
            record={records[vaccine.id]}
            onPress={() => {
              setSelectedVaccine(vaccine);
              setModalVisible(true);
            }}
          />
        ))}
      </ScrollView>
      <VaccineForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        vaccine={selectedVaccine}
        onSave={handleSaveVaccine}
        initialData={selectedVaccine ? records[selectedVaccine.id] : null}
      />
    </SafeAreaView>
  );
}

// Subcomponente para mostrar cada vacuna
function VaccineItem({ vaccine, record, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.vaccineItem,
        record && styles.vaccineItemDone,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.vaccineName}>{vaccine.name}</Text>
        <Text style={styles.vaccineAge}>{vaccine.age}</Text>
        {record ? (
          <Text style={styles.vaccineDone}>
            Administrada el {new Date(record.date).toLocaleDateString("es-CL")}
            {"\n"}Centro: {record.center}
          </Text>
        ) : (
          <Text style={styles.vaccinePending}>Pendiente</Text>
        )}
      </View>
      <Text style={styles.vaccineAction}>{record ? "Editar" : "Registrar"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  vaccineItem: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    borderLeftWidth: 6,
    borderLeftColor: Colors.PRIMARY,
  },
  vaccineItemDone: {
    backgroundColor: "#e6f7e6",
    borderLeftColor: "#2e7d32",
  },
  vaccineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  vaccineAge: {
    fontSize: 14,
    color: Colors.DARK_GRAY,
    marginBottom: 4,
  },
  vaccineDone: {
    color: "#2e7d32",
    fontSize: 14,
    marginTop: 4,
  },
  vaccinePending: {
    color: Colors.DARK_GRAY,
    fontSize: 14,
    marginTop: 4,
  },
  vaccineAction: {
    fontWeight: "bold",
    color: Colors.PRIMARY,
    fontSize: 15,
    marginLeft: 12,
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f7fa",
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
});