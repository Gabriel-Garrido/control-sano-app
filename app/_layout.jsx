import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/FirebaseConfig";
import LoadingScreen from "../components/LoadingScreen";

/**
 * Layout raíz de la app.
 * Verifica si el usuario está autenticado en Firebase antes de mostrar las pantallas.
 * Si está verificando, muestra un loading.
 * Si no hay usuario, redirige a login.
 */
export default function RootLayout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Escucha cambios de autenticación en Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Si no hay usuario, redirige a login
        router.replace("/login");
      }
      setCheckingAuth(false);
    });
    // Limpia el listener al desmontar
    return () => unsubscribe();
  }, []);

  // Muestra loading mientras se verifica el estado de autenticación
  if (checkingAuth) {
    return <LoadingScreen text="Verificando sesión..." />;
  }

  // Renderiza las pantallas principales si el usuario está autenticado
  return (
    <Stack screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
    </Stack>
  );
}