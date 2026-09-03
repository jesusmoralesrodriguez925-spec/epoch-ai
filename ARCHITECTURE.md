# ARCHITECTURE: Arquitectura Técnica de KODI AI Studio

KODI AI Studio está concebido bajo una arquitectura cliente-servidor desacoplada, reactiva y resiliente ante fallos, garantizando alta disponibilidad y privacidad en el manejo de credenciales.

---

## 🏛️ 1. Diagrama General del Sistema

```text
+-------------------------------------------------------------------------+
|                         CAPA CLIENTE (FRONTEND)                         |
|   +-----------------------------------------------------------------+   |
|   |  React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons     |   |
|   |  • Dashboard Reactivo (Gestión de Sesiones & Streaming)        |   |
|   |  • Editor de Código con soporte de Tabulación e Historial      |   |
|   |  • PWA Service Worker + APK Wrapper Android (Capacitor/WebView) |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
                                    │
                       HTTPS / REST / Streaming (JSON)
                                    ▼
+-------------------------------------------------------------------------+
|                         CAPA SERVIDOR (BACKEND)                         |
|   +-----------------------------------------------------------------+   |
|   |  Node.js + Express + TypeScript Core (server.ts)                |   |
|   |  • Middleware de Seguridad: Helmet, CORS, Rate Limiting         |   |
|   |  • Validación de Esquemas: Zod en cada endpoint                 |   |
|   |  • Orquestador Multi-Modelo en Cascada con Fallback Automático  |   |
|   |  • Motor de Verificación On-Chain (Etherscan / BSC BEP20)       |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
         │                              │                         │
         ▼                              ▼                         ▼
+-------------------+        +--------------------+      +--------------------+
|  PROVEEDORES IA   |        | PERSISTENCIA DATOS |      |   BLOCKCHAIN BSC   |
| • Google Gemini   |        | • Firebase Auth    |      | • BSCScan RPC /    |
|   (Nova Core/Max) |        | • Supabase Postgres|      |   Etherscan API    |
| • Groq LPUs       |        | • LocalStorage Sync|      | • Contrato USDT    |
|   (Omniscient 3.0)|        |   en el cliente    |      |   BEP20            |
| • Tavily Search   |        +--------------------+      +--------------------+
+-------------------+
```

---

## 💻 2. Frontend: React 19 + TypeScript

- **Framework**: React 19 con renderizado concurrente y hooks modernos.
- **Estilos**: Tailwind CSS con paleta dark/light contrastada y tokens ópticos para evitar fatiga visual en sesiones prolongadas.
- **Gestión de Estado**: Estado centralizado modular (`Dashboard.tsx`, `ChatMessageList.tsx`, `ChatInputBar.tsx`) con refs de seguridad (`isStreamingRef`) para evitar condiciones de carrera durante la recepción de chunks de texto.
- **Persistencia Híbrida**: Cache instantáneo en `localStorage` con reconciliación no destructiva (`mergeChatSessions`) contra el backend.

---

## ⚙️ 3. Backend: Express + TypeScript Engine

- **Punto de Entrada**: `server.ts` compilado a Node CJS/ESM.
- **Pipeline de Solicitudes**:
  1. **Autenticación**: Decodificación de cabeceras `x-user-id`, `x-user-plan` y `x-user-name`.
  2. **Validación Zod**: Sanitización de inputs para evitar inyecciones de código y desbordamientos.
  3. **Rate Limiter por Nivel**: Control de cuota según el plan (Free: 10/h, Pro: 100/h, Max: 1000/h).
  4. **Orquestador de Resiliencia**:
     - Intenta la llamada al modelo preferido con timeout configurable.
     - Si el proveedor devuelve saturación (503) o demora, conmuta de forma automática e imperceptible al cluster Groq LPU de alta disponibilidad.
     - Aplica enriquecimiento contextual de Tavily AI cuando la consulta requiere datos en tiempo real.

---

## 🗄️ 4. Persistencia y Almacenamiento

1. **Firebase Authentication**: Gestión de identidades, tokens JWT y sesiones federadas.
2. **Supabase PostgreSQL / Cloud Firestore**: Almacenamiento seguro de perfiles de usuario, balance de créditos y registros de transacciones.
3. **Persistencia Local Segura**: Cada usuario mantiene un respaldo cifrado localmente de sus conversaciones, accesible offline.

---

## ⛓️ 5. Capa de Pagos y Verificación Blockchain

- Red: **Binance Smart Chain (BSC - BEP20)**.
- Token: **USDT (Tether USD)**.
- Mecanismo:
  - El usuario transfiere los USDT a la billetera oficial de Epoch.
  - Envía el Transaction Hash (`txHash`) al endpoint `/api/crypto/verify-payment`.
  - El backend consulta el explorador de bloques (BSCScan/Etherscan API), valida emisor, receptor, monto exacto y confirmaciones de bloque, activando la suscripción de forma instantánea.

[Siguiente: Documentación de la API ➔](./API.md)
