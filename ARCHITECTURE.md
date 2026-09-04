> **KODI AI Studio by Jesús Morales Rodriguez**  
> **Producto**: KODI AI Studio v1.0  
> **Creador**: Jesús Morales Rodriguez  

KODI AI Studio está concebido bajo una arquitectura cliente-servidor desacoplada, reactiva y resiliente ante fallos, garantizando alta disponibilidad, baja latencia y máxima seguridad en el manejo de credenciales.

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

💻 2. Frontend: React 19 + TypeScript
Framework: React 19 con renderizado concurrente y hooks de última generación.
Estilos y Ergonomía: Tailwind CSS con paleta dark/light balanceada y tokens ópticos que reducen la fatiga ocular en sesiones prolongadas.
Gestión de Estado: Arquitectura modular desacoplada con referencias de sincronización seguras para evitar condiciones de carrera durante el streaming de tokens.
Persistencia Híbrida: Almacenamiento local ultrarrápido en el navegador (localStorage) con conciliación de datos no destructiva ante sincronizaciones con el backend.
⚙️ 3. Backend: Express + TypeScript Engine
Punto de Entrada: server.ts con compilación optimizada a Node.js.
Pipeline de Solicitudes:
Autenticación: Validación de identificadores y roles de usuario (x-user-id, x-user-plan).
Validación Zod: Sanitización y tipado estricto de cada parámetro de entrada para neutralizar inyecciones de código.
Rate Limiter Dinámico: Aplicación de límites por nivel de suscripción (Free: 10/h, Pro: 100/h, Max: 1,000/h).
Orquestador Multi-Modelo Resiliente:
Lanza la consulta al modelo preferido con timeout supervisado.
En caso de saturación o error del proveedor primario, conmuta de forma automática al clúster Groq LPU sin interrumpir la experiencia del usuario.
Realiza grounding en tiempo real con la API de Tavily cuando la consulta demanda datos web verificables.
🗄️ 4. Persistencia y Almacenamiento
Firebase Authentication: Gestión de sesiones, identidades y tokens federados con altos estándares de seguridad.
Supabase / PostgreSQL: Registro de usuarios, balances de cuota y auditoría de transacciones criptográficas.
Almacenamiento Local Cifrado: Cada usuario mantiene un respaldo de sus chats directamente en su cliente, accesible sin conexión.
⛓️ 5. Capa de Pagos y Verificación Blockchain
Red: Binance Smart Chain (BSC - BEP20).
Criptoactivo: USDT (Tether USD BEP20).
Flujo de Activación:
El usuario efectúa la transferencia de USDT a la dirección oficial de KODI.
Envía el hash de transacción (txHash) mediante el endpoint /api/crypto/verify-payment.
El backend verifica la transacción contra la blockchain mediante las APIs de BSCScan/Etherscan, validando emisor, receptor, monto y confirmaciones de bloque, activando la suscripción en segundos.
⬅️ Anterior: Especificación de Modelos • Siguiente: Documentación de la API ➔
