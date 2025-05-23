import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { auth } from "../config/FirebaseConfig";

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
        // Verifica si router.pathname está definido antes de usarlo
        if (router?.pathname && !router.pathname.startsWith("/login")) {
          router.replace("/login/signIn");
        }
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Muestra loading mientras se verifica el estado de autenticación
  if (checkingAuth) {
    return <LoadingScreen text="Verificando sesión..." />;
  }

  // Renderiza las pantallas principales si el usuario está autenticado
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
