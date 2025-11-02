"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  createInvitation,
  getInvitationsByResidential,
} from "@/lib/firebase/db";
import { formatDate } from "@/lib/utils";
import type { Invitation } from "@/lib/types";
import { Mail, Plus, CheckCircle, Clock, XCircle, Copy } from "lucide-react";

// Generate unique token
const generateToken = () => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
};

export default function InvitationsPage() {
  const router = useRouter();
  const { user, appUser, loading } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [apartment, setApartment] = useState("");
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && appUser && appUser.role !== "owner") {
      router.push("/dashboard");
    }
  }, [user, appUser, loading, router]);

  useEffect(() => {
    const loadInvitations = async () => {
      if (!appUser || appUser.role !== "owner") return;

      try {
        const invs = await getInvitationsByResidential(appUser.residentialId);
        setInvitations(invs);
      } catch (error) {
        console.error("Error loading invitations:", error);
      } finally {
        setLoadingInvitations(false);
      }
    };

    loadInvitations();
  }, [appUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (!appUser) return;

      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      await createInvitation({
        residentialId: appUser.residentialId,
        email: email.trim().toLowerCase(),
        token,
        status: "pending",
        expiresAt,
      });

      // Generate invitation link
      const invitationLink = `${
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      }/invitation/accept?token=${token}`;

      setSuccess(
        `Invitación creada exitosamente. Envía este enlace al residente: ${invitationLink}`
      );

      setEmail("");
      setApartment("");

      // Reload invitations
      const invs = await getInvitationsByResidential(appUser.residentialId);
      setInvitations(invs);
    } catch (err: any) {
      setError(err.message || "Error al crear invitación");
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    }/invitation/accept?token=${token}`;
    navigator.clipboard.writeText(link);
    setSuccess("Enlace copiado al portapapeles");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading || !user || !appUser || appUser.role !== "owner") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Invitar Residentes
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Envía invitaciones a nuevos residentes para que puedan unirse a tu
            residencial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Invitación
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg whitespace-pre-wrap">
                  {success}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Correo Electrónico del Resident
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="residente@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="apartment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Apartamento/Unidad (opcional)
                </label>
                <input
                  id="apartment"
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Apto 201"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Creando invitación..." : "Crear Invitación"}
              </button>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Invitaciones Enviadas
            </h2>

            {loadingInvitations ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : invitations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay invitaciones
              </p>
            ) : (
              <ul className="space-y-3">
                {invitations.map((inv) => (
                  <li
                    key={inv.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">
                            {inv.email}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(inv.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {inv.status === "pending" ? (
                          <>
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs text-yellow-600">
                              Pendiente
                            </span>
                            <button
                              onClick={() => copyInvitationLink(inv.token)}
                              className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-700 ml-2"
                              title="Copiar enlace"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar
                            </button>
                          </>
                        ) : inv.status === "accepted" ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600">
                              Aceptada
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-600">
                              Expirada
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
