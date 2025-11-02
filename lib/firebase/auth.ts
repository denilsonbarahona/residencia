import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  NextOrObserver,
} from "firebase/auth";
import { auth } from "./config";

export const registerUser = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase auth not initialized");
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase auth not initialized");
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  if (!auth) throw new Error("Firebase auth not initialized");
  return await signOut(auth);
};

export const onAuthStateChange = (
  callback: NextOrObserver<FirebaseUser | null>
) => {
  if (!auth) throw new Error("Firebase auth not initialized");
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  if (!auth) return null;
  return auth.currentUser;
};
