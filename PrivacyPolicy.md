# POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES
**KODI AI STUDIO (v6.4.0)**
*Última actualización: 29 de Agosto de 2026*

---

## 1. INTRODUCCIÓN Y ALCANCE
En **KODI AI Studio**, desarrollado por **Jesús Morales Rodríguez** (en adelante, "KODI", "la Plataforma", "nosotros" o "nuestro"), nos tomamos muy en serio la privacidad y la confidencialidad de la información de nuestros usuarios. Esta Política de Privacidad describe exhaustivamente cómo recopilamos, utilizamos, almacenamos, procesamos y protegemos tus datos personales cuando interactúas con nuestra suite de desarrollo asistido por Inteligencia Artificial y nuestros servicios asociados.

Esta política se redacta en estricto cumplimiento con el **Reglamento General de Protección de Datos de la Unión Europea (GDPR / RGPD)**, la **Ley de Privacidad del Consumidor de California (CCPA)**, la normativa europea **EU AI Act** y las directrices de la **FTC** relativas a transparencia y veracidad en plataformas digitales.

---

## 2. AVISO OBLIGATORIO DE PROCESAMIENTO POR INTELIGENCIA ARTIFICIAL (IA)
> **DECLARACIÓN EXPRESA:** KODI AI Studio utiliza modelos y sistemas avanzados de Inteligencia Artificial (IA) provistos por **Google Gemini** (Gemini 3.7 / 2.5) y **Groq Inc.** (Llama 3.3 70B), así como el motor de búsqueda en tiempo real de **Tavily AI Search**. Al utilizar la Plataforma, reconoces y aceptas expresamente que el contenido de tus prompts, mensajes, fragmentos de código e instrucciones técnicas será procesado por estos proveedores externos de infraestructura de IA exclusivamente para generar las respuestas y ejecuciones solicitadas.

---

## 3. DATOS PERSONALES QUE RECOPILAMOS

Recopilamos únicamente las categorías de datos estrictamente necesarias para el aprovisionamiento de las herramientas de software:

1. **Datos de Cuenta y Perfil:**
   - Nombre completo o alias visible.
   - Dirección de correo electrónico verificada.
   - Nivel de suscripción activo (`free`, `pro`, `max`) y fecha de caducidad.
   - Proveedor de autenticación (`password`, `google`).
   - Registros de consentimiento legal y marcas de tiempo (`timestamps`).

2. **Datos de Uso y Contenido Generado:**
   - Historial de prompts, mensajes de chat y solicitudes de ingeniería.
   - Código fuente redactado, analizado o ejecutado dentro del sandbox.
   - Archivos y adjuntos cargados temporalmente en el espacio de trabajo.
   - Métricas de rendimiento de ejecución (tiempo en ms, consumo de RAM en MB).

3. **Datos Técnicos y Telemétricos:**
   - Dirección IP pública utilizada al momento del consentimiento y registro (como prueba legal ante auditorías).
   - Tipo de navegador, sistema operativo y cabeceras estándar HTTP.
   - Registros de auditoría interna de seguridad (`logs` sanitizados).

4. **Datos de Facturación y Cripto-Pagos:**
   - Hash público de transacción en la blockchain BNB Smart Chain (BEP20).
   - Monto transferido en USDT y dirección pública emisora/receptora.
   - *Nota Importante:* **KODI NO almacena ni procesa números de tarjetas de crédito, claves privadas ni datos bancarios sensibles.**

---

## 4. TERCEROS PROVEEDORES Y SUBCONTRATISTAS DE DATOS

Para proporcionar nuestras capacidades de ingeniería y computación distribuida, compartimos datos estrictamente anonimizados o delimitados con los siguientes proveedores:

| Proveedor | Finalidad del Procesamiento | Ubicación / Cumplimiento |
| :--- | :--- | :--- |
| **Google LLC (Gemini API / Vertex)** | Inferencia de lenguaje, razonamiento arquitectónico y generación de código | EE.UU. / UE - SOC 2 / GDPR |
| **Groq Inc.** | Compilación de inferencia ultrarrápida Llama 3.3 | EE.UU. - SOC 2 / ISO 27001 |
| **Tavily Technologies Inc.** | Recuperación y búsqueda web técnica en tiempo real | EE.UU. - GDPR Compliant |
| **Etherscan / BscScan API** | Consulta pública de transacciones USDT en la blockchain | Global / Descentralizado |
| **Supabase Inc. / Google Cloud** | Aprovisionamiento de base de datos PostgreSQL y almacenamiento cifrado | Global / ISO 27001 / GDPR |

---

## 5. DERECHOS DEL USUARIO (GDPR, CCPA Y DERECHO AL OLVIDO)

Como titular de los datos, gozas de los siguientes derechos inalienables que puedes ejercer en cualquier momento:

- **Derecho de Acceso:** Conocer con exactitud qué datos personales y de actividad conservamos sobre ti.
- **Derecho de Portabilidad (Exportación JSON):** Descargar una copia completa y legible por máquina de todos tus chats, proyectos, código e información de perfil en formato `.json` mediante el endpoint `/api/user/data-export`.
- **Derecho de Rectificación:** Corregir información inexacta o desactualizada desde tu panel de Configuración.
- **Derecho al Olvido y Eliminación Total (Right to Erasure):** Puedes solicitar la eliminación irreversible de tu cuenta y todos tus datos. Nuestro sistema garantiza la purga total en un plazo máximo de **48 horas**.

---

## 6. POLÍTICA DE RETENCIÓN Y DESTRUCCIÓN DE DATOS

- **Cuentas Activas:** Los datos se conservan mientras la cuenta de usuario permanezca operativa.
- **Solicitud de Eliminación:** Tras la confirmación de borrado, todos los registros de perfil, chats, archivos y cachés son destruidos permanentemente en un plazo máximo de **48 horas**.
- **Respaldos de Seguridad:** Las copias de seguridad automáticas de contingencia son sobreescritas en un ciclo no mayor a 30 días.
- **Logs de Cumplimiento Legal:** Se conservan únicamente registros criptográficamente anonimizados de marcas de tiempo de consentimiento e identificadores de transacciones contables exigidos por ley.

---

## 7. SEGURIDAD DE LA INFORMACIÓN

Implementamos salvaguardas técnicas y organizativas de nivel empresarial:
- Cifrado en tránsito mediante TLS 1.3 y HTTPS forzado.
- Cifrado en reposo en bases de datos con AES-256.
- Cabeceras HTTP de seguridad reforzadas mediante **Helmet**.
- Políticas de Rate Limiting por nivel de suscripción para mitigar ataques de denegación de servicio.
- Sanitización continua de logs (`sanitizeForLog`) para impedir la filtración accidental de credenciales o tokens.

---

## 8. POLÍTICA SOBRE TESTIMONIOS Y RESEÑAS

En cumplimiento estricto con las directrices de la FTC y la legislación contra la publicidad engañosa:
- Todos los testimonios exhibidos en KODI corresponden a usuarios reales con cuentas verificadas.
- Queda terminantemente prohibida la generación de testimonios ficticios, reseñas automatizadas por bots o declaraciones no autorizadas.
- Cualquier usuario puede solicitar la revocación y retiro inmediato de su testimonio en cualquier momento escribiendo a nuestro oficial de privacidad.

---

## 9. PROTECCIÓN DE MENORES (COPPA)

KODI AI Studio está diseñado exclusivamente para desarrolladores, profesionales y personas mayores de 16 años (o 13 años con consentimiento parental explícito en jurisdicciones aplicables). No recopilamos intencionalmente información de menores de edad. Si detectamos una cuenta perteneciente a un menor sin consentimiento válido, procederemos a su eliminación inmediata.

---

## 10. DELEGADO DE PROTECCIÓN DE DATOS Y CONTACTO LEGAL

Para consultas legales, ejercicio de derechos ARCO/GDPR o solicitudes de eliminación urgente:

- **Creador y Desarrollador:** Jesús Morales Rodríguez
- **Oficial de Privacidad / Delegado de Protección de Datos:** Jesús Morales Rodríguez
- **Correo Electrónico Legal:** `jesusmoralesrodriguez925@gmail.com`
- **Plataforma:** KODI Autonomous Software Engineering Core
- **Sitio Web:** [https://ais-dev-4p7rfw3msob3xodaa5kekw-187599177255.europe-west2.run.app](https://ais-dev-4p7rfw3msob3xodaa5kekw-187599177255.europe-west2.run.app)
