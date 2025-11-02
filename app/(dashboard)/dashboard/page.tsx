"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getQRCodesByResidential,
  getResidentsByResidential,
  getQRCodesByUser,
} from "@/lib/firebase/db";
import { Building2, Users, QrCode, Clock } from "lucide-react";
import ActiveQRList from "@/app/components/qr/ActiveQRList";
import type { QRCode as QRCodeType, User as UserType } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();
  const [stats, setStats] = useState({
    totalQR: 0,
    activeQR: 0,
    totalResidents: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadStats = async () => {
      if (!appUser) return;

      try {
        if (appUser.role === "owner") {
          const qrCodes = await getQRCodesByResidential(appUser.residentialId);
          const residents = await getResidentsByResidential(
            appUser.residentialId
          );
          const activeQR = qrCodes.filter(
            (qr) => qr.isActive && new Date(qr.expiresAt) > new Date()
          );

          setStats({
            totalQR: qrCodes.length,
            activeQR: activeQR.length,
            totalResidents: residents.length,
          });
        } else {
          const qrCodes = await getQRCodesByUser(appUser.id);
          const activeQR = qrCodes.filter(
            (qr) => qr.isActive && new Date(qr.expiresAt) > new Date()
          );

          setStats({
            totalQR: qrCodes.length,
            activeQR: activeQR.length,
            totalResidents: 0,
          });
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    loadStats();
  }, [appUser]);

  if (loading || !user || !appUser) {
    return null;
  }

  const isOwner = appUser.role === "owner";

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {appUser.name}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isOwner
              ? "Panel de control del propietario"
              : "Panel de control del residente"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <QrCode className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      QR Totales Generados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalQR}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      QR Activos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeQR}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Residentes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalResidents}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isOwner && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              QR Activos
            </h2>
            <ActiveQRList user={appUser} />
          </div>
        )}

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isOwner ? (
              <>
                <button
                  onClick={() => router.push("/residents")}
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Gestionar Residentes
                </button>
                <button
                  onClick={() => router.push("/invitations")}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Invitar Residentes
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/qr/generate")}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Generar Nuevo QR
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
