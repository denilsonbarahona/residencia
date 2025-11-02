"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import QRGenerator from "@/app/components/qr/QRGenerator";

export default function GenerateQRPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && appUser && appUser.role === "owner") {
      router.push("/dashboard");
    }
  }, [user, appUser, loading, router]);

  if (loading || !user || !appUser || appUser.role === "owner") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Generar QR de Acceso
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Crea un código QR para acceso temporal (válido por 4 horas)
          </p>
        </div>

        <QRGenerator
          user={appUser}
          onGenerate={() => {
            // QR generated successfully
          }}
        />
      </div>
    </DashboardLayout>
  );
}
