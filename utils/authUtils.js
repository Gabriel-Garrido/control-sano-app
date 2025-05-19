import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/FirebaseConfig";
import { getLocalStorage } from "../service/Storage";

export const verifyUserInFirebase = async (router) => {
  const userInfo = await getLocalStorage("userDetail");
  console.log("Obteniendo usuario de localStorage:", userInfo);

  if (!userInfo) {
    console.log("No hay usuario en localStorage. Redirigiendo a login.");
    router.replace('/login');
    return;
  }

  onAuthStateChanged(auth, (firebaseUser) => {
    console.log("Usuario autenticado en Firebase:", firebaseUser);
    if (!firebaseUser || firebaseUser.email !== userInfo.email) {
      console.log("El usuario de Firebase no coincide o no existe. Redirigiendo a login.");
      router.replace('/login');
    } else {
      console.log("Usuario verificado correctamente en Firebase.");
    }
  });
};