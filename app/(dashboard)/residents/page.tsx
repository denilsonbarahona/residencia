"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import { getResidentsByResidential, updateUser } from "@/lib/firebase/db";
import { formatDate } from "@/lib/utils";
import type { User } from "@/lib/types";
import { Users, Ban, CheckCircle, XCircle } from "lucide-react";

export default function ResidentsPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();
  const [residents, setResidents] = useState<User[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && appUser && appUser.role !== "owner") {
      router.push("/dashboard");
    }
  }, [user, appUser, loading, router]);

  useEffect(() => {
    const loadResidents = async () => {
      if (!appUser || appUser.role !== "owner") {
        console.log("Cannot load residents: appUser or role check failed", {
          appUser: !!appUser,
          role: appUser?.role,
          residentialId: appUser?.residentialId,
        });
        setLoadingResidents(false);
        return;
      }

      if (!appUser.residentialId) {
        console.error("appUser.residentialId is not defined!");
        setLoadingResidents(false);
        return;
      }

      try {
        console.log(
          "Loading residents for residential:",
          appUser.residentialId
        );
        const res = await getResidentsByResidential(appUser.residentialId);
        console.log("Loaded residents:", res.length, res);
        setResidents(res);
      } catch (error: any) {
        console.error("Error loading residents:", error);
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
        setLoadingResidents(false);
      }
    };

    loadResidents();
  }, [appUser]);

  const handleRevokeAccess = async (residentId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que deseas revocar el acceso de este resident?"
      )
    ) {
      return;
    }

    setRevoking(residentId);
    try {
      await updateUser(residentId, { active: false });
      setResidents((prev) =>
        prev.map((r) => (r.id === residentId ? { ...r, active: false } : r))
      );
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Error al revocar acceso");
    } finally {
      setRevoking(null);
    }
  };

  const handleRestoreAccess = async (residentId: string) => {
    setRevoking(residentId);
    try {
      await updateUser(residentId, { active: true });
      setResidents((prev) =>
        prev.map((r) => (r.id === residentId ? { ...r, active: true } : r))
      );
    } catch (error) {
      console.error("Error restoring access:", error);
      alert("Error al restaurar acceso");
    } finally {
      setRevoking(null);
    }
  };

  if (loading || !user || !appUser || appUser.role !== "owner") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Residentes
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra los residentes de tu residencial
          </p>
        </div>

        {loadingResidents ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : residents.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No hay residentes registrados todavía
            </p>
            <button
              onClick={() => router.push("/invitations")}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Invitar primer resident
            </button>
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
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apartamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {residents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {resident.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {resident.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {resident.apartment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(resident.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {resident.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Revocado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {resident.active ? (
                        <button
                          onClick={() => handleRevokeAccess(resident.id)}
                          disabled={revoking === resident.id}
                          className="inline-flex items-center text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          {revoking === resident.id
                            ? "Revocando..."
                            : "Revocar Acceso"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestoreAccess(resident.id)}
                          disabled={revoking === resident.id}
                          className="inline-flex items-center text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {revoking === resident.id
                            ? "Restaurando..."
                            : "Restaurar Acceso"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
