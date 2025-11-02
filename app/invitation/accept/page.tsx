"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getInvitationByToken,
  updateInvitation,
  createUser,
} from "@/lib/firebase/db";
import { registerUser } from "@/lib/firebase/auth";
import { User, Lock, Building2, XCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    apartment: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError("Token de invitación no válido");
        setLoading(false);
        return;
      }

      try {
        const inv = await getInvitationByToken(token);
        if (!inv) {
          setError("Invitación no encontrada");
          setLoading(false);
          return;
        }

        if (inv.status !== "pending") {
          setError("Esta invitación ya fue utilizada o ha expirado");
          setLoading(false);
          return;
        }

        if (new Date(inv.expiresAt) < new Date()) {
          setError("Esta invitación ha expirado");
          setLoading(false);
          return;
        }

        setInvitation(inv);
      } catch (err: any) {
        setError(err.message || "Error al cargar invitación");
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!invitation) return;

    setSubmitting(true);

    try {
      // Register with Firebase Auth
      const userCredential = await registerUser(
        invitation.email,
        formData.password
      );
      const userId = userCredential.user.uid;

      // Create user document
      await createUser(userId, {
        email: invitation.email,
        role: "resident",
        residentialId: invitation.residentialId,
        apartment: formData.apartment || "N/A",
        name: formData.name,
        active: true,
        createdAt: new Date(),
      });

      // Update invitation status
      await updateInvitation(invitation.id, { status: "accepted" });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error al aceptar invitación");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Cuenta Creada!
          </h1>
          <p className="text-gray-600 mb-6">
            Tu cuenta ha sido creada exitosamente. Serás redirigido al inicio de
            sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Aceptar Invitación
          </h1>
          <p className="text-gray-600 mt-2">
            Completa tu registro como resident
          </p>
          {invitation && (
            <p className="text-sm text-indigo-600 mt-1">{invitation.email}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="apartment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Apartamento/Unidad
            </label>
            <input
              id="apartment"
              type="text"
              value={formData.apartment}
              onChange={(e) =>
                setFormData({ ...formData, apartment: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Apto 201"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
