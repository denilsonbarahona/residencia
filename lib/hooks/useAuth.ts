"use client";

import { useEffect, useState } from "react";
import { onAuthStateChange, getCurrentUser } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/db";
import type { User as AppUser } from "@/lib/types";
import { User as FirebaseUser } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userData = await getUser(firebaseUser.uid);
          setAppUser(userData);
        } catch (error) {
          console.error("Error loading user data:", error);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, appUser, loading };
}
