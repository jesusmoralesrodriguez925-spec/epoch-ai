> **KODI AI Studio by Jesús Morales Rodriguez**  
> **Producto**: KODI AI Studio v1.0  
> **Creador**: Jesús Morales Rodriguez  

La API de **KODI AI Studio** permite interactuar de manera programática con los motores de inferencia, el entorno de ejecución de código, la gestión de proyectos y la verificación de pagos criptográficos.

---

## 🔒 1. Autenticación y Cabeceras

Todas las solicitudes a los endpoints de la API deben incluir las siguientes cabeceras HTTP:

| Cabecera | Tipo | Obligatorio | Descripción |
| :--- | :--- | :---: | :--- |
| `Content-Type` | String | Sí | `application/json` |
| `x-user-id` | String | Sí | Identificador único de usuario (UID de Firebase o sesión) |
| `x-user-plan` | String | No | Nivel de suscripción actual: `free`, `pro` o `max` |
| `x-user-name` | String | No | Nombre del usuario codificado en URI (`encodeURIComponent`) |

---

## 📡 2. Catálogo de Endpoints Principales

### 2.1 Generación de Respuestas de IA
**`POST /api/kodi/generate`**

Procesa un mensaje o una conversación completa invocando el orquestador multi-modelo de KODI con soporte para razonamiento, auditoría de librerías y búsqueda web en vivo.

#### Parámetros de Entrada (JSON Body)
```json
{
  "message": "¿Cómo implementar un hook useDebounce en React 19 con TypeScript?",
  "modelId": "omniscient-3.0",
  "history": [
    { "role": "user", "text": "Hola KODI" },
    { "role": "kodi", "text": "¡Hola! ¿En qué puedo colaborar contigo hoy?" }
  ],
  "isReasoningActive": true,
  "useWebSearch": true,
  "attachments": []
}

Respuesta Exitosa (200 OK)
{
  "text": "Para implementar un hook personalizado useDebounce en React 19...",
  "verifiedByTavily": true,
  "libraryAudit": {
    "isVerified": true,
    "timestamp": "18:45",
    "details": "Librerías validadas correctamente"
  },
  "codePerformance": {
    "executionTimeMs": 210,
    "memoryUsageMb": 12.8
  },
  "planUsed": "pro",
  "durationMs": 285
}

2.2 Ejecución de Código en Sandbox
POST /api/execute-code
Ejecuta de forma aislada y segura fragmentos de código en lenguajes soportados (Python, JavaScript, Bash) en un entorno con límites estrictos de tiempo y memoria.
Parámetros de Entrada
{
  "language": "python",
  "code": "print([x**2 for x in range(1, 11)])",
  "timeoutMs": 5000
}
Respuesta Exitosa (200 OK)
{
  "success": true,
  "stdout": "[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\n",
  "stderr": "",
  "executionTimeMs": 38,
  "memoryUsedKb": 7650
}
2.3 Gestión de Workspace y Archivos
GET /api/workspace
Recupera el árbol de archivos y el estado del espacio de trabajo del usuario.
Respuesta Exitosa (200 OK)
{
  "workspaceId": "ws_kodi_98124",
  "files": [
    { "path": "main.py", "sizeBytes": 1024, "updatedAt": "2026-09-03T16:00:00Z" },
    { "path": "types.ts", "sizeBytes": 2048, "updatedAt": "2026-09-03T16:10:00Z" }
  ],
  "storageUsedMb": 2.4,
  "storageLimitMb": 500
}
2.4 Verificación de Pagos Cripto (USDT BEP20)
POST /api/crypto/verify-payment
Valida una transacción en la Binance Smart Chain para activar de inmediato una suscripción Pro o Max.
Parámetros de Entrada
{
  "txHash": "0x4b72a912f129a738c8216503c73491f27891234567890abcdef1234567890abc",
  "planTier": "pro",
  "userId": "usr_98124"
}
Respuesta Exitosa (200 OK)
{
  "verified": true,
  "planTier": "pro",
  "amountReceived": 15.0,
  "currency": "USDT (BEP20)",
  "activatedAt": "2026-09-03T18:45:00Z",
  "expiresAt": "2026-10-03T18:45:00Z"
}
⚠️ 3. Códigos de Estado y Errores
Código	Mensaje	Causa
400 Bad Request	Validation failed	El formato del cuerpo JSON no cumple con el esquema Zod requerido.
401 Unauthorized	Missing or invalid user credentials	Falta la cabecera x-user-id o la sesión no es válida.
429 Too Many Requests	Rate limit exceeded for current plan	Se superó el número de solicitudes por hora permitidas en el plan.
500 Internal Server Error	AI Provider transient error	Error temporal del proveedor de IA; se conmuta al clúster de respaldo.
⬅️ Anterior: Arquitectura Técnica • Siguiente: Seguridad, Privacidad y Términos ➔

