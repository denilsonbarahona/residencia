import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Validar que todas las variables de entorno necesarias estén configuradas
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar variables de entorno
const validateEnvVars = () => {
  const missingVars: string[] = [];

  if (!requiredEnvVars.apiKey) missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!requiredEnvVars.authDomain)
    missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!requiredEnvVars.projectId)
    missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!requiredEnvVars.storageBucket)
    missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!requiredEnvVars.messagingSenderId)
    missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!requiredEnvVars.appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  if (missingVars.length > 0 && typeof window !== "undefined") {
    console.error(
      "❌ Variables de entorno de Firebase faltantes:\n" +
        missingVars.join("\n") +
        "\n\nPor favor, configura estas variables en tu archivo .env.local"
    );
  }

  return missingVars.length === 0;
};

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || "",
  authDomain: requiredEnvVars.authDomain || "",
  projectId: requiredEnvVars.projectId || "",
  storageBucket: requiredEnvVars.storageBucket || "",
  messagingSenderId: requiredEnvVars.messagingSenderId || "",
  appId: requiredEnvVars.appId || "",
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined") {
  // Validar variables de entorno antes de inicializar Firebase
  const isValid = validateEnvVars();

  if (isValid) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.error(
      "Firebase no se pudo inicializar debido a variables de entorno faltantes."
    );
  }
}

export { auth, db };
export default app;
