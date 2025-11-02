import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type {
  User,
  Residential,
  Invitation,
  QRCode,
  AccessLog,
} from "@/lib/types";

if (!db) {
  throw new Error("Firestore not initialized");
}

// User operations
export const createUser = async (
  userId: string,
  userData: Omit<User, "id">
) => {
  if (!db) throw new Error("Firestore not initialized");
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
  });
  return userRef;
};

export const getUser = async (userId: string): Promise<User | null> => {
  if (!db) throw new Error("Firestore not initialized");
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: userSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as User;
  }
  return null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const q = query(
    collection(db, "users"),
    where("email", "==", email),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as User;
  }
  return null;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, updates);
};

// Residential operations
export const createResidential = async (
  residentialId: string,
  residentialData: Omit<Residential, "id" | "createdAt">
) => {
  const residentialRef = doc(db, "residentials", residentialId);
  await setDoc(residentialRef, {
    ...residentialData,
    createdAt: serverTimestamp(),
  });
  return residentialRef;
};

export const getResidential = async (
  residentialId: string
): Promise<Residential | null> => {
  const residentialRef = doc(db, "residentials", residentialId);
  const residentialSnap = await getDoc(residentialRef);
  if (residentialSnap.exists()) {
    const data = residentialSnap.data();
    return {
      id: residentialSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Residential;
  }
  return null;
};

// Invitation operations
export const createInvitation = async (
  invitationData: Omit<Invitation, "id" | "createdAt">
) => {
  const invitationsRef = collection(db, "invitations");
  const invitationDoc = doc(invitationsRef);
  await setDoc(invitationDoc, {
    ...invitationData,
    createdAt: serverTimestamp(),
  });
  return invitationDoc.id;
};

export const getInvitation = async (
  invitationId: string
): Promise<Invitation | null> => {
  const invitationRef = doc(db, "invitations", invitationId);
  const invitationSnap = await getDoc(invitationRef);
  if (invitationSnap.exists()) {
    const data = invitationSnap.data();
    return {
      id: invitationSnap.id,
      ...data,
      expiresAt: data.expiresAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Invitation;
  }
  return null;
};

export const getInvitationByToken = async (
  token: string
): Promise<Invitation | null> => {
  const q = query(
    collection(db, "invitations"),
    where("token", "==", token),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      expiresAt: data.expiresAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Invitation;
  }
  return null;
};

export const getInvitationsByResidential = async (
  residentialId: string
): Promise<Invitation[]> => {
  const q = query(
    collection(db, "invitations"),
    where("residentialId", "==", residentialId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      expiresAt: data.expiresAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Invitation;
  });
};

export const updateInvitation = async (
  invitationId: string,
  updates: Partial<Invitation>
) => {
  const invitationRef = doc(db, "invitations", invitationId);
  await updateDoc(invitationRef, updates);
};

// QR Code operations
export const createQRCode = async (
  qrData: Omit<QRCode, "id" | "createdAt">
) => {
  const qrCodesRef = collection(db, "qrCodes");
  const qrCodeDoc = doc(qrCodesRef);
  await setDoc(qrCodeDoc, {
    ...qrData,
    createdAt: serverTimestamp(),
  });
  return qrCodeDoc.id;
};

export const getQRCode = async (qrCodeId: string): Promise<QRCode | null> => {
  const qrCodeRef = doc(db, "qrCodes", qrCodeId);
  const qrCodeSnap = await getDoc(qrCodeRef);
  if (qrCodeSnap.exists()) {
    const data = qrCodeSnap.data();
    return {
      id: qrCodeSnap.id,
      ...data,
      expiresAt: data.expiresAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as QRCode;
  }
  return null;
};

export const getQRCodeByData = async (
  qrData: string
): Promise<QRCode | null> => {
  const q = query(
    collection(db, "qrCodes"),
    where("qrData", "==", qrData),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      expiresAt: data.expiresAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as QRCode;
  }
  return null;
};

export const getQRCodesByUser = async (userId: string): Promise<QRCode[]> => {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const q = query(collection(db, "qrCodes"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const codes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        expiresAt: data.expiresAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      } as QRCode;
    });

    // Sort by createdAt descending manually to avoid index requirement
    return codes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error getting QR codes by user:", error);
    throw error;
  }
};

export const getQRCodesByResidential = async (
  residentialId: string
): Promise<QRCode[]> => {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    console.log("Querying QR codes for residentialId:", residentialId);
    const q = query(
      collection(db, "qrCodes"),
      where("residentialId", "==", residentialId)
    );
    const querySnapshot = await getDocs(q);
    console.log("Query snapshot size:", querySnapshot.size);
    console.log("Query snapshot empty:", querySnapshot.empty);

    const codes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("QR code data:", {
        id: doc.id,
        residentialId: data.residentialId,
        userId: data.userId,
        createdAt: data.createdAt,
      });
      return {
        id: doc.id,
        ...data,
        expiresAt: data.expiresAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      } as QRCode;
    });

    console.log("Mapped codes:", codes.length);
    // Sort by createdAt descending manually to avoid index requirement
    const sortedCodes = codes.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    console.log("Sorted codes:", sortedCodes.length);
    return sortedCodes;
  } catch (error: any) {
    console.error("Error getting QR codes by residential:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const updateQRCode = async (
  qrCodeId: string,
  updates: Partial<QRCode>
) => {
  const qrCodeRef = doc(db, "qrCodes", qrCodeId);
  await updateDoc(qrCodeRef, updates);
};

// Delete QR Code
export const deleteQRCode = async (qrCodeId: string): Promise<void> => {
  try {
    const qrCodeRef = doc(db, "qrCodes", qrCodeId);
    await deleteDoc(qrCodeRef);
  } catch (error) {
    console.error("Error deleting QR code:", error);
    throw error;
  }
};

// Resident operations
export const getResidentsByResidential = async (
  residentialId: string
): Promise<User[]> => {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    console.log("Querying residents for residentialId:", residentialId);
    const q = query(
      collection(db, "users"),
      where("residentialId", "==", residentialId),
      where("role", "==", "resident")
    );
    const querySnapshot = await getDocs(q);
    console.log("Query snapshot size (residents):", querySnapshot.size);
    console.log("Query snapshot empty (residents):", querySnapshot.empty);

    const residents = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("Resident data:", {
        id: doc.id,
        name: data.name,
        email: data.email,
        residentialId: data.residentialId,
        role: data.role,
        active: data.active,
      });
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as User;
    });

    console.log("Mapped residents:", residents.length);
    // Sort by createdAt descending manually to avoid index requirement
    const sortedResidents = residents.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    console.log("Sorted residents:", sortedResidents.length);
    return sortedResidents;
  } catch (error: any) {
    console.error("Error getting residents by residential:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Access Log operations
export const createAccessLog = async (logData: Omit<AccessLog, "id">) => {
  const logsRef = collection(db, "accessLogs");
  const logDoc = doc(logsRef);
  await setDoc(logDoc, {
    ...logData,
    scannedAt: serverTimestamp(),
  });
  return logDoc.id;
};
