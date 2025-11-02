// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const generateQRData = (
  userId: string,
  apartment: string,
  residentName: string
): string => {
  const data = {
    id: generateId(),
    userId,
    apartment,
    residentName,
    timestamp: Date.now(),
  };
  return JSON.stringify(data);
};

// Note: generateQRImage is not used in the project
// QR codes are generated client-side using qrcode.react
// export const generateQRImage = async (data: string): Promise<string> => {
//   try {
//     const QRCode = await import("qrcode");
//     const qrCodeDataURL = await QRCode.default.toDataURL(data, {
//       errorCorrectionLevel: "M",
//       margin: 1,
//       color: {
//         dark: "#000000",
//         light: "#FFFFFF",
//       },
//     });
//     return qrCodeDataURL;
//   } catch (err) {
//     throw new Error("Error generando QR code");
//   }
// };

export const parseQRData = (
  data: string
): {
  id: string;
  userId: string;
  apartment: string;
  residentName: string;
  timestamp: number;
} | null => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};
