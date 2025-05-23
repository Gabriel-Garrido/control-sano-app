import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-88CJZ91Os-EZ-0P_i7m5GGynXYztSgs",
  authDomain: "control-sano.firebaseapp.com",
  projectId: "control-sano",
  storageBucket: "control-sano.firebasestorage.app",
  messagingSenderId: "397190833494",
  appId: "1:397190833494:web:1eca6f1e02cbba723362f7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.warn("No user authenticated"); // Ajustado para evitar spam
  }
});
