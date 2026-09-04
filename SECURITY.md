# SECURITY 

> **KODI AI Studio by Jesús Morales Rodriguez**  
> **Producto**: KODI AI Studio v1.0  
> **Creador**: Jesús Morales Rodriguez  

En **KODI AI Studio**, desarrollado por **Jesús Morales Rodriguez**, la protección de la privacidad, la seguridad de la información y la soberanía de los datos de cada usuario constituyen pilares de diseño innegociables.

---

## 🛡️ 1. Políticas de Seguridad de la Información

### 1.1 Cifrado de Datos
- **En Tránsito**: Todas las comunicaciones entre el cliente (web o APK Android) y el backend se realizan forzosamente mediante **TLS 1.3** con suites criptográficas modernas.
- **En Reposo**: Las bases de datos y tokens se encuentran protegidos mediante algoritmos de cifrado de grado militar **AES-256**.
- **Cabeceras de Protección**: Implementación completa de **Helmet** en Express (Content Security Policy, X-Frame-Options, X-Content-Type-Options y HSTS).

### 1.2 Auditoría y Aislamiento de Código (Sandbox)
- La ejecución de código de usuario se ejecuta en entornos sandboxed estrictamente delimitados con cuotas de memoria de proceso y límites temporales de ejecución para prevenir bucles infinitos, bifurcaciones de procesos (fork bombs) o accesos al sistema de archivos del host.
- No se almacenan credenciales sensibles ni claves de API en el cliente. Todas las llamadas a modelos externos se realizan desde el backend a través de variables de entorno seguras.

---

## ⚖️ 2. Cumplimiento Normativo (GDPR y CCPA)

KODI AI Studio opera en estricta conformidad con el **Reglamento General de Protección de Datos de la Unión Europea (RGPD / GDPR)** y la **California Consumer Privacy Act (CCPA)**:

1. **Derecho de Acceso y Portabilidad**:
   - Cada usuario puede descargar en cualquier momento una copia íntegra y legible por máquina de sus datos, chats y perfiles mediante la función de exportación JSON en Configuración.
2. **Derecho de Rectificación**:
   - Facilidad inmediata para modificar nombres, correos y preferencias desde la interfaz de usuario.
3. **Derecho al Olvido (Eliminación en 48 Horas)**:
   - Cualquier solicitud de eliminación de cuenta recibida a través del panel de usuario o del correo de soporte garantiza la purga física y criptográfica definitiva de todos los registros, bases de datos y copias de seguridad en un plazo máximo e improrrogable de **48 horas**.

---

## 🤖 3. Uso Responsable de Inteligencia Artificial

- **Cero Entrenamiento con Datos de Usuarios**:
  - Las consultas, prompts, código fuente y archivos cargados por los usuarios **NO se utilizan para entrenar, reentrenar ni afinar modelos de IA comerciales**, ni propios ni de terceros proveedores.
- **Transparencia en Razonamiento**:
  - Las cadenas de pensamiento técnico (Thinking Mode) se exponen de forma transparente para permitir la verificación metodológica de las respuestas proporcionadas.
- **Veracidad de Información (Tavily Grounding)**:
  - Para minimizar alucinaciones en hechos fácticos o librerías recientes, KODI contrasta datos en tiempo real mediante búsqueda web técnica contextualizada.

---

## 💳 4. Seguridad en Transacciones Criptográficas

- **Pagos No Custodiales**:
  - KODI AI Studio **NO almacena tarjetas de crédito, datos bancarios ni claves privadas de billeteras**.
  - Los pagos de suscripciones se realizan directamente de billetera a billetera mediante contratos estándar de **USDT (BEP20)** en la Binance Smart Chain, garantizando anonimato financiero y trazabilidad pública inmutable.

---

## 📬 5. Contacto Legal y Reporte de Vulnerabilidades

Si descubres una posible vulnerabilidad de seguridad o deseas ejercer tus derechos legales de acceso o eliminación de datos:

- **Creador y Desarrollador**: Jesús Morales Rodriguez  
- **Email de Contacto**: [jesusmoralesrodriguez925@gmail.com](mailto:jesusmoralesrodriguez925@gmail.com)  
- **Plataforma**: KODI AI Studio v1.0  
- **Respuesta de Emergencia**: Plazo máximo de atención de incidentes de seguridad: 24 horas.

---

[⬅️ Anterior: Documentación de la API](./API.md) • [Volver al Índice General 🏠](./README.md)
