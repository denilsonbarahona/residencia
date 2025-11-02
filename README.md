# Sistema de Gestión de Accesos Residencial con QR Codes

Sistema completo para gestionar accesos a residenciales mediante códigos QR con expiración automática de 4 horas.

## Características

- **Autenticación**: Sistema de registro y login con Firebase Auth
- **Roles**: Propietarios y Residentes con permisos diferentes
- **Gestión de Residentes**: Los propietarios pueden invitar residentes por email
- **Generación de QR**: Los residentes pueden generar códigos QR de acceso con notas
- **Expiración Automática**: Los QR codes expiran automáticamente después de 4 horas
- **Validación Estándar**: Los QR codes siguen formato ISO/IEC 18004 para compatibilidad con trancas de seguridad
- **Historial**: Propietarios pueden ver todos los QR generados; residentes pueden ver su propio historial
- **Revocación de Accesos**: Propietarios pueden revocar/restaurar accesos de residentes

## Tecnologías

- **Next.js 14+** con App Router
- **TypeScript**
- **Firebase** (Authentication y Firestore)
- **Tailwind CSS**
- **Lucide React** (iconos)
- **QRCode.react** (generación de QR)

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication con Email/Password
3. Crea una base de datos Firestore
4. Copia las credenciales de Firebase

### 3. Variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto (copia desde `env.example.txt`):

   ```bash
   cp env.example.txt .env.local
   ```

   O crea manualmente el archivo `.env.local` en la raíz del proyecto.

2. Abre Firebase Console y ve a tu proyecto:

   - [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto (o créalo si no tienes uno)
   - Ve a **Configuración del proyecto** (ícono de engranaje)
   - Baja hasta **Tus apps** y haz clic en el ícono `</>` (Web)
   - Copia los valores del objeto `firebaseConfig`

3. Edita `.env.local` y reemplaza los valores con tus credenciales de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota:** El archivo `.env.local` no se sube a git por seguridad. Asegúrate de configurarlo en cada entorno de desarrollo.

### 4. Configurar reglas de Firestore

Copia el contenido de `firestore.rules` y pégalo en la configuración de reglas de Firestore en Firebase Console.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
/app
  /(auth)              # Páginas de autenticación
  /(dashboard)         # Páginas del dashboard
  /api                 # API endpoints
  /components          # Componentes reutilizables
  /invitation          # Aceptación de invitaciones
/lib
  /firebase            # Configuración y funciones de Firebase
  /hooks               # Custom hooks
  /types               # Tipos TypeScript
  /utils               # Utilidades
```

## Flujo de Uso

### Para Propietarios:

1. **Registro**: Crea una cuenta como propietario (primera cuenta)
2. **Invitar Residentes**: Genera invitaciones y envía el enlace por email
3. **Gestionar Residentes**: Ve lista de residentes y revoca/restaura accesos
4. **Ver Historial**: Consulta todos los QR codes generados por los residentes

### Para Residentes:

1. **Aceptar Invitación**: Recibe enlace de invitación y completa registro
2. **Generar QR**: Crea códigos QR de acceso con notas opcionales
3. **Ver Historial**: Consulta tus propios QR codes generados

## API Endpoints

### Validar QR Code

**POST** `/api/qr/validate`

```json
{
  "qrData": "string"
}
```

**Respuesta exitosa:**

```json
{
  "valid": true,
  "message": "Access granted",
  "data": {
    "residentName": "string",
    "apartment": "string",
    "note": "string",
    "expiresAt": "ISO date string"
  }
}
```

**GET** `/api/qr/validate?data=<qrData>` - Versión simplificada para trancas de seguridad

## Seguridad

- Validación de roles en cliente y servidor
- Reglas de seguridad de Firestore configuradas
- Tokens de invitación con expiración
- Validación de QR codes en backend
- Sanitización de inputs

## Notas Importantes

- Los QR codes expiran automáticamente después de 4 horas
- El sistema de invitaciones genera enlaces que deben ser enviados manualmente (no hay integración de email automática)
- Las trancas de seguridad pueden usar el endpoint GET `/api/qr/validate` para validación rápida

## Producción

1. Configura las variables de entorno en tu plataforma de hosting
2. Despliega las reglas de Firestore desde `firestore.rules`
3. Configura el dominio en Firebase Console
4. Habilita CORS si es necesario para las trancas de seguridad

## Licencia

MIT
