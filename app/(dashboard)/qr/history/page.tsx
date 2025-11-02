"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import { getQRCodesByUser, deleteQRCode } from "@/lib/firebase/db";
import { formatDate, getTimeRemaining } from "@/lib/utils";
import type { QRCode } from "@/lib/types";
import { Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function QRHistoryPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && appUser && appUser.role === "owner") {
      router.push("/dashboard");
    }
  }, [user, appUser, loading, router]);

  const loadQRCodes = async () => {
    if (!appUser) return;

    try {
      const codes = await getQRCodesByUser(appUser.id);
      setQrCodes(codes);
    } catch (error) {
      console.error("Error loading QR codes:", error);
    } finally {
      setLoadingCodes(false);
    }
  };

  useEffect(() => {
    loadQRCodes();
  }, [appUser]);

  const handleDelete = async (qrId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este QR?")) {
      return;
    }

    try {
      await deleteQRCode(qrId);
      await loadQRCodes(); // Reload the list
    } catch (error) {
      console.error("Error deleting QR code:", error);
      alert("Error al eliminar el QR. Intenta de nuevo.");
    }
  };

  if (loading || !user || !appUser || appUser.role === "owner") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mi Historial de QR
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Todos los códigos QR que has generado
          </p>
        </div>

        {loadingCodes ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : qrCodes.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No has generado ningún QR todavía</p>
            <button
              onClick={() => router.push("/qr/generate")}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Generar mi primer QR
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {qrCodes.map((qr) => {
                const timeRemaining = getTimeRemaining(qr.expiresAt);
                const isExpired = timeRemaining.expired || !qr.isActive;

                return (
                  <li key={qr.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {isExpired ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Creado: {formatDate(qr.createdAt)}
                            </p>
                            {qr.note && (
                              <p className="text-sm text-gray-500 mt-1">
                                Nota: {qr.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {isExpired ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Expirado
                            </span>
                          ) : (
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center text-indigo-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {timeRemaining.hours}h {timeRemaining.minutes}m{" "}
                                {timeRemaining.seconds}s
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(qr.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Eliminar QR"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
