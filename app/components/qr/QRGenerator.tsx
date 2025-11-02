"use client";

import { useState, useEffect } from "react";
import QRCodeReact from "qrcode.react";
import { generateQRData, parseQRData } from "@/lib/utils/qr";
import { createQRCode } from "@/lib/firebase/db";
import { getTimeRemaining } from "@/lib/utils";
import { Download, X } from "lucide-react";
import type { User } from "@/lib/types";

interface QRGeneratorProps {
  user: User;
  onGenerate: () => void;
}

export default function QRGenerator({ user, onGenerate }: QRGeneratorProps) {
  const [note, setNote] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQR = async () => {
    if (!user) return;

    if (!visitorName.trim()) {
      setError("El nombre del visitante es obligatorio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const expires = new Date();
      expires.setHours(expires.getHours() + 4);

      const qrDataString = generateQRData(user.id, user.apartment, user.name);
      const qrCodeId = await createQRCode({
        userId: user.id,
        residentialId: user.residentialId,
        qrData: qrDataString,
        note: note.trim(),
        visitorName: visitorName.trim(),
        expiresAt: expires,
        isActive: true,
        apartment: user.apartment,
        residentName: user.name,
        createdAt: new Date(),
      });

      setQrData(qrDataString);
      setQrId(qrCodeId);
      setExpiresAt(expires);
      onGenerate();
    } catch (err: any) {
      setError(err.message || "Error al generar QR");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement("a");
      link.download = `qr-access-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  const resetQR = () => {
    setQrData(null);
    setQrId(null);
    setExpiresAt(null);
    setNote("");
    setVisitorName("");
  };

  if (qrData && expiresAt) {
    const timeRemaining = getTimeRemaining(expiresAt);
    const parsedData = parseQRData(qrData);

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">QR Generado</h3>
          <button
            onClick={resetQR}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <QRCodeReact value={qrData} size={256} level="M" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Residente:</strong> {parsedData?.residentName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Apartamento:</strong> {parsedData?.apartment}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Visitante:</strong> {visitorName}
            </p>
            {note && (
              <p className="text-sm text-gray-600">
                <strong>Nota:</strong> {note}
              </p>
            )}
            <p className="text-lg font-semibold text-gray-900 mt-4">
              {timeRemaining.expired ? (
                <span className="text-red-600">Expirado</span>
              ) : (
                <span className="text-indigo-600">
                  Expira en: {timeRemaining.hours}h {timeRemaining.minutes}m{" "}
                  {timeRemaining.seconds}s
                </span>
              )}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={downloadQR}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar QR
            </button>
            <button
              onClick={resetQR}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generar Nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Generar QR de Acceso
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="visitorName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nombre del Visitante <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="visitorName"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            required
            className="w-full px-3 py-2 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Juan Pérez, María García, etc."
          />
        </div>
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nota (opcional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-700 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Visita familiar, Entrega de paquete, etc."
          />
        </div>

        <button
          onClick={generateQR}
          disabled={loading || !visitorName.trim()}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Generando QR..." : "Generar QR de Acceso"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          El QR generado expirará automáticamente después de 4 horas
        </p>
      </div>
    </div>
  );
}
