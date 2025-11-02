"use client";

import { useEffect, useState } from "react";
import { getQRCodesByUser, deleteQRCode } from "@/lib/firebase/db";
import { formatDate } from "@/lib/utils";
import { useCountdown } from "@/lib/hooks/useCountdown";
import QRCodeReact from "qrcode.react";
import { Clock, Download, XCircle, Trash2 } from "lucide-react";
import type { User, QRCode } from "@/lib/types";

interface ActiveQRListProps {
  user: User;
}

export default function ActiveQRList({ user }: ActiveQRListProps) {
  const [activeQRCodes, setActiveQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActiveQR = async () => {
      if (!user?.id) return;

      try {
        const allCodes = await getQRCodesByUser(user.id);

        const now = new Date();
        const active = allCodes.filter((qr) => {
          const isActive = qr.isActive !== false; // Default to true if undefined
          const expiresAtDate =
            qr.expiresAt instanceof Date
              ? qr.expiresAt
              : new Date(qr.expiresAt);
          const notExpired = expiresAtDate > now;
          return isActive && notExpired;
        });

        setActiveQRCodes(active);
      } catch (error) {
        console.error("Error loading active QR codes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveQR();
    const interval = setInterval(loadActiveQR, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [user.id]);

  const downloadQR = (qrId: string, note: string) => {
    const canvas = document.querySelector(`canvas[data-qr-id="${qrId}"]`);
    if (canvas) {
      const url = (canvas as HTMLCanvasElement).toDataURL();
      const link = document.createElement("a");
      link.download = `qr-access-${note || Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleDelete = async (qrId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este QR?")) {
      return;
    }

    try {
      await deleteQRCode(qrId);
      // Reload the list
      const allCodes = await getQRCodesByUser(user.id);
      const now = new Date();
      const active = allCodes.filter((qr) => {
        const isActive = qr.isActive !== false;
        const expiresAtDate =
          qr.expiresAt instanceof Date ? qr.expiresAt : new Date(qr.expiresAt);
        const notExpired = expiresAtDate > now;
        return isActive && notExpired;
      });
      setActiveQRCodes(active);
    } catch (error) {
      console.error("Error deleting QR code:", error);
      alert("Error al eliminar el QR. Intenta de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (activeQRCodes.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No tienes códigos QR activos</p>
        <p className="text-sm text-gray-400 mt-2">
          Genera un nuevo QR para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeQRCodes.map((qr) => {
        const parsedData = qr.qrData ? JSON.parse(qr.qrData) : null;
        return (
          <QRCard
            key={qr.id}
            qr={qr}
            parsedData={parsedData}
            onDownload={downloadQR}
            onDelete={handleDelete}
          />
        );
      })}
    </div>
  );
}

function QRCard({
  qr,
  parsedData,
  onDownload,
  onDelete,
}: {
  qr: QRCode;
  parsedData: any;
  onDownload: (qrId: string, note: string) => void;
  onDelete: (qrId: string) => void;
}) {
  const timeRemaining = useCountdown(qr.expiresAt);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">Creado</p>
          <p className="text-xs text-gray-400">{formatDate(qr.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDownload(qr.id, qr.note)}
            className="text-gray-400 hover:text-gray-600"
            title="Descargar QR"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(qr.id)}
            className="text-red-400 hover:text-red-600"
            title="Eliminar QR"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <QRCodeReact
            value={qr.qrData}
            size={180}
            level="M"
            data-qr-id={qr.id}
          />
        </div>
      </div>

      <div className="space-y-2 text-center">
        {parsedData && (
          <>
            <p className="text-sm text-gray-600">
              <strong>Resident:</strong>{" "}
              {parsedData.residentName || qr.residentName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Apartamento:</strong>{" "}
              {parsedData.apartment || qr.apartment}
            </p>
          </>
        )}
        {qr.note && (
          <p className="text-sm text-gray-600">
            <strong>Nota:</strong> {qr.note}
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            {timeRemaining.expired ? (
              <span className="text-red-600 font-semibold">Expirado</span>
            ) : (
              <span className="text-indigo-600 font-semibold">
                {timeRemaining.hours}h {timeRemaining.minutes}m{" "}
                {timeRemaining.seconds}s
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
