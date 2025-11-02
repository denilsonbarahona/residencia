export type UserRole = "owner" | "resident";

export type InvitationStatus = "pending" | "accepted" | "expired";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  residentialId: string;
  apartment: string;
  name: string;
  createdAt: Date;
  active: boolean;
}

export interface Residential {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  residentialId: string;
  email: string;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface QRCode {
  id: string;
  userId: string;
  residentialId: string;
  qrData: string;
  note: string;
  visitorName?: string;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
  apartment: string;
  residentName: string;
}

export interface AccessLog {
  id: string;
  qrCodeId: string;
  userId: string;
  residentialId: string;
  scannedAt: Date;
  isValid: boolean;
  reason?: string;
}
