"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getQRCodesByResidential,
  getResidentsByResidential,
  deleteQRCode,
} from "@/lib/firebase/db";
import { formatDate, getTimeRemaining } from "@/lib/utils";
import type { QRCode, User } from "@/lib/types";
import { Clock, CheckCircle, XCircle, Search, Trash2 } from "lucide-react";

export default function QRHistoryPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [residents, setResidents] = useState<User[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCodes, setLoadingCodes] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && appUser && appUser.role !== "owner") {
      router.push("/dashboard");
    }
  }, [user, appUser, loading, router]);

  const loadData = async () => {
    if (!appUser || appUser.role !== "owner") {
      console.log("Cannot load data: appUser or role check failed", {
        appUser: !!appUser,
        role: appUser?.role,
        residentialId: appUser?.residentialId,
      });
      setLoadingCodes(false);
      return;
    }

    if (!appUser.residentialId) {
      console.error("appUser.residentialId is not defined!");
      setLoadingCodes(false);
      return;
    }

    try {
      console.log("Loading QR codes for residential:", appUser.residentialId);
      const [codes, res] = await Promise.all([
        getQRCodesByResidential(appUser.residentialId),
        getResidentsByResidential(appUser.residentialId),
      ]);
      console.log("Loaded QR codes:", codes.length, codes);
      console.log("Loaded residents:", res.length);
      setQrCodes(codes);
      setResidents(res);
    } catch (error: any) {
      console.error("Error loading data:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      if (error.code === "failed-precondition") {
        alert(
          "Error: Se requiere un índice en Firestore. Por favor, revisa la consola para más detalles."
        );
      } else if (error.code === "permission-denied") {
        alert(
          "Error: Permisos insuficientes. Por favor, verifica las reglas de Firestore."
        );
      }
    } finally {
      setLoadingCodes(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [appUser]);

  const handleDelete = async (qrId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este QR?")) {
      return;
    }

    try {
      await deleteQRCode(qrId);
      await loadData(); // Reload the list
    } catch (error) {
      console.error("Error deleting QR code:", error);
      alert("Error al eliminar el QR. Intenta de nuevo.");
    }
  };

  const getResidentName = (userId: string) => {
    const resident = residents.find((r) => r.id === userId);
    return resident?.name || "Desconocido";
  };

  const filteredCodes = qrCodes.filter((qr) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" &&
        qr.isActive &&
        new Date(qr.expiresAt) > new Date()) ||
      (filter === "expired" &&
        (!qr.isActive || new Date(qr.expiresAt) <= new Date()));

    const matchesSearch =
      !searchTerm ||
      getResidentName(qr.userId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      qr.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (qr.visitorName &&
        qr.visitorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (qr.note && qr.note.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  if (loading || !user || !appUser || appUser.role !== "owner") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Historial de QR Generados
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Todos los códigos QR generados por los residentes
          </p>
        </div>

        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por resident, apartamento, visitante o nota..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "active"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilter("expired")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "expired"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Expirados
              </button>
            </div>
          </div>
        </div>

        {loadingCodes ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No se encontraron códigos QR</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apartamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCodes.map((qr) => {
                  const timeRemaining = getTimeRemaining(qr.expiresAt);
                  const isExpired = timeRemaining.expired || !qr.isActive;

                  return (
                    <tr key={qr.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getResidentName(qr.userId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {qr.apartment}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {qr.visitorName || (
                            <span className="text-gray-400">
                              Sin especificar
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {qr.note || (
                            <span className="text-gray-400">Sin nota</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(qr.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isExpired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Expirado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Clock className="w-3 h-3 mr-1" />
                            {timeRemaining.hours}h {timeRemaining.minutes}m{" "}
                            {timeRemaining.seconds}s
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(qr.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Eliminar QR"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
