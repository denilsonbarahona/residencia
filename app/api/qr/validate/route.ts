import { NextRequest, NextResponse } from "next/server";
import {
  getQRCodeByData,
  createAccessLog,
  updateQRCode,
} from "@/lib/firebase/db";
import { parseQRData } from "@/lib/utils/qr";

export async function POST(request: NextRequest) {
  try {
    const { qrData } = await request.json();

    if (!qrData) {
      return NextResponse.json(
        { valid: false, message: "QR data is required" },
        { status: 400 }
      );
    }

    // Parse QR data
    const parsed = parseQRData(qrData);
    if (!parsed) {
      await createAccessLog({
        qrCodeId: "unknown",
        userId: "unknown",
        residentialId: "unknown",
        scannedAt: new Date(),
        isValid: false,
        reason: "Invalid QR format",
      });

      return NextResponse.json(
        { valid: false, message: "Invalid QR format" },
        { status: 400 }
      );
    }

    // Find QR code in database
    const qrCode = await getQRCodeByData(qrData);

    if (!qrCode) {
      await createAccessLog({
        qrCodeId: parsed.id,
        userId: parsed.userId,
        residentialId: "unknown",
        scannedAt: new Date(),
        isValid: false,
        reason: "QR code not found in database",
      });

      return NextResponse.json(
        { valid: false, message: "QR code not found" },
        { status: 404 }
      );
    }

    // Check if QR is active
    if (!qrCode.isActive) {
      await createAccessLog({
        qrCodeId: qrCode.id,
        userId: qrCode.userId,
        residentialId: qrCode.residentialId,
        scannedAt: new Date(),
        isValid: false,
        reason: "QR code is inactive",
      });

      return NextResponse.json(
        { valid: false, message: "QR code is inactive" },
        { status: 403 }
      );
    }

    // Check if QR is expired
    const now = new Date();
    const expiresAt = qrCode.expiresAt;

    if (expiresAt <= now) {
      // Mark as inactive
      await updateQRCode(qrCode.id, { isActive: false });

      await createAccessLog({
        qrCodeId: qrCode.id,
        userId: qrCode.userId,
        residentialId: qrCode.residentialId,
        scannedAt: new Date(),
        isValid: false,
        reason: "QR code expired",
      });

      return NextResponse.json(
        { valid: false, message: "QR code has expired" },
        { status: 403 }
      );
    }

    // Valid QR code
    await createAccessLog({
      qrCodeId: qrCode.id,
      userId: qrCode.userId,
      residentialId: qrCode.residentialId,
      scannedAt: new Date(),
      isValid: true,
    });

    return NextResponse.json({
      valid: true,
      message: "Access granted",
      data: {
        residentName: qrCode.residentName,
        apartment: qrCode.apartment,
        note: qrCode.note,
        expiresAt: qrCode.expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error validating QR code:", error);
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for simple validation (for security gates)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const qrData = searchParams.get("data");

  if (!qrData) {
    return NextResponse.json(
      { valid: false, message: "QR data is required" },
      { status: 400 }
    );
  }

  try {
    const parsed = parseQRData(qrData);
    if (!parsed) {
      return NextResponse.json(
        { valid: false, message: "Invalid QR format" },
        { status: 400 }
      );
    }

    const qrCode = await getQRCodeByData(qrData);

    if (!qrCode || !qrCode.isActive || qrCode.expiresAt <= new Date()) {
      return NextResponse.json({ valid: false }, { status: 403 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
