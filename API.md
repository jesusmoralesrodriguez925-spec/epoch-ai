# API: Especificaci贸n de Endpoints REST de KODI AI Studio

La API de **KODI AI Studio** permite interactuar de manera program谩tica con los motores de inferencia, ejecuci贸n de c贸digo, gesti贸n de workspaces y verificaci贸n de pagos.

---

## 馃敀 1. Autenticaci贸n y Cabeceras

Todas las llamadas a endpoints protegidos deben incluir las siguientes cabeceras HTTP:

| Cabecera | Tipo | Descripci贸n |
| :--- | :--- | :--- |
| `Content-Type` | String | `application/json` |
| `x-user-id` | String | ID 煤nico de usuario (UID de Firebase o identificador de sesi贸n) |
| `x-user-plan` | String | *(Opcional)* `free`, `pro` o `max` |
| `x-user-name` | String | *(Opcional)* Nombre codificado en URI (`encodeURIComponent`) |

---

## 馃摗 2. Cat谩logo de Endpoints Principales

### 2.1 Generaci贸n de Respuestas de IA
**`POST /api/kodi/generate`**

Procesa un mensaje o conversaci贸n completa invocando el motor orquestador de KODI con soporte para razonamiento, auditor铆a y b煤squeda web.

#### Par谩metros de Entrada (JSON Body)
```json
{
  "message": "驴C贸mo implementar un debounce en TypeScript?",
  "modelId": "omniscient-3.0",
  "history": [
    { "role": "user", "text": "Hola KODI" },
    { "role": "kodi", "text": "隆Hola! 驴En qu茅 te puedo ayudar?" }
  ],
  "isReasoningActive": true,
  "useWebSearch": true,
  "attachments": []
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "text": "Para implementar un debounce en TypeScript...",
  "verifiedByTavily": true,
  "libraryAudit": {
    "isVerified": true,
    "timestamp": "16:45",
    "details": "Librer铆as validadas correctamente"
  },
  "codePerformance": {
    "executionTimeMs": 240,
    "memoryUsageMb": 14.2
  },
  "planUsed": "pro",
  "durationMs": 310
}
```

---

### 2.2 Ejecuci贸n de C贸digo en Sandbox
**`POST /api/execute-code`**

Ejecuta de manera segura fragmentos de c贸digo en lenguajes soportados (Python, JavaScript, Bash) en un contenedor aislado con l铆mites de CPU y memoria.

#### Par谩metros de Entrada
```json
{
  "language": "python",
  "code": "print(sum([x**2 for x in range(10)]))",
  "timeoutMs": 5000
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "stdout": "285\n",
  "stderr": "",
  "executionTimeMs": 42,
  "memoryUsedKb": 8340
}
```

---

### 2.3 Gesti贸n de Workspace / Proyectos
**`GET /api/workspace`**

Recupera el 谩rbol de archivos y estado del espacio de trabajo del usuario.

#### Respuesta Exitosa (200 OK)
```json
{
  "workspaceId": "ws_usr_98124",
  "files": [
    { "path": "main.py", "sizeBytes": 1024, "updatedAt": "2026-09-02T16:00:00Z" },
    { "path": "utils.ts", "sizeBytes": 2048, "updatedAt": "2026-09-02T16:10:00Z" }
  ],
  "storageUsedMb": 3.1,
  "storageLimitMb": 500
}
```

---

### 2.4 Verificaci贸n de Pago Cripto (USDT BEP20)
**`POST /api/crypto/verify-payment`**

Valida una transacci贸n de Binance Smart Chain para activar una suscripci贸n Pro o Max.

#### Par谩metros de Entrada
```json
{
  "txHash": "0x4b72a912f129a738c8216503c73491f2...",
  "planTier": "pro",
  "userId": "usr_98124"
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "verified": true,
  "planTier": "pro",
  "amountReceived": 15.0,
  "currency": "USDT (BEP20)",
  "activatedAt": "2026-09-02T16:47:00Z",
  "expiresAt": "2026-10-02T16:47:00Z"
}
```

---

## 鈿狅笍 3. C贸digos de Error Comunes

| C贸digo | Mensaje | Causa |
| :--- | :--- | :--- |
| `400 Bad Request` | `Validation failed` | El esquema de payload no cumple con las reglas Zod requeridas. |
| `401 Unauthorized` | `Missing or invalid user credentials` | Falta la cabecera `x-user-id` o el token de sesi贸n ha expirado. |
| `429 Too Many Requests` | `Rate limit exceeded for current plan` | El usuario super贸 la cuota por hora de su plan actual. |
| `500 Internal Server Error` | `AI Provider transient error` | Falla no recuperable en el cl煤ster de inferencia; se activa fallback. |

[Siguiente: Seguridad, Privacidad y Normativas 鉃擼(./SECURITY.md)
