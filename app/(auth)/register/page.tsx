"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/firebase/auth";
import {
  createUser,
  createResidential,
  getUserByEmail,
} from "@/lib/firebase/db";
import { Lock, Mail, Building2, User, MapPin } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    residentialName: "",
    residentialAddress: "",
    apartment: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

    setLoading(true);

    try {
      // Register with Firebase Auth first
      // This will fail if email already exists in Auth
      const userCredential = await registerUser(
        formData.email,
        formData.password
      );
      const userId = userCredential.user.uid;

      // Create residential first (this allows user creation to reference it)
      const residentialId = userId; // Using userId as residentialId for simplicity
      await createResidential(residentialId, {
        ownerId: userId,
        name: formData.residentialName,
        address: formData.residentialAddress,
      });

      // Create user document
      await createUser(userId, {
        email: formData.email,
        role: "owner",
        residentialId,
        apartment: formData.apartment || "N/A",
        name: formData.name,
        active: true,
        createdAt: new Date(),
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registro de Propietario
          </h1>
          <p className="text-gray-600 mt-2">
            Crea tu cuenta para gestionar accesos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="Apto 101"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="residentialName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre de la Residencial
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="residentialName"
                type="text"
                value={formData.residentialName}
                onChange={(e) =>
                  setFormData({ ...formData, residentialName: e.target.value })
                }
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Residencial Los Pinos"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="residentialAddress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Dirección de la Residencial
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="residentialAddress"
                type="text"
                value={formData.residentialAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    residentialAddress: e.target.value,
                  })
                }
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Calle Principal #123"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
