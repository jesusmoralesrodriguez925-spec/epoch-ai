## 🔒 1. Principios Fundamentales de Seguridad

- **Cifrado Integral en Tránsito y en Reposo**: Todas las comunicaciones entre el cliente (Web / APK Android) y los servidores de Epoch se realizan de forma obligatoria mediante canales cifrados TLS 1.3. Los datos y credenciales en reposo utilizan el estándar de cifrado AES-256.
- **Validación Estricta de Entradas**: Cada endpoint de la API implementa esquemas declarativos tipados con la librería **Zod**, previniendo ataques de inyección SQL, Cross-Site Scripting (XSS) y manipulación de parámetros.
- **Aislamiento de Entornos de Ejecución (Sandboxing)**: La ejecución de código en Python, JavaScript o Bash se lleva a cabo en contenedores efímeros aislados con privilegios mínimos, sin acceso a la red interna ni a las variables de entorno del sistema anfitrión.

---

## 📜 2. Política de Privacidad (GDPR & CCPA Compliant)

### 2.1 Datos que Recopilamos
- **Información de Cuenta**: Correo electrónico, nombre de usuario configurado y fecha de registro.
- **Métricas de Uso**: Metadatos analíticos de inferencia (tokens procesados, modelo seleccionado y marcas de tiempo) para control de cuotas por plan.
- **Contenido de Conversaciones**: Los mensajes se procesan para inferencia en tiempo real. **Epoch NO vende, no comercializa ni utiliza el contenido de tus conversaciones para entrenar modelos públicos de inteligencia artificial**.

### 2.2 Base Legal del Tratamiento
Procesamos tus datos bajo el consentimiento explícito otorgado al iniciar sesión, y bajo la necesidad contractual para entregarte el servicio de IA solicitado (Artículo 6(1)(b) del RGPD de la Unión Europea).

---

## ⚖️ 3. Derechos del Usuario y Eliminación de Datos (48 Horas)

En estricto apego al Reglamento General de Protección de Datos (GDPR) de la Unión Europea y a la Ley de Privacidad del Consumidor de California (CCPA):

- **Derecho de Acceso y Portabilidad**: Puedes exportar tu historial de conversaciones en cualquier momento desde el panel de Configuración.
- **Derecho al Olvido (Eliminación Definitiva en 48 Horas)**:
  - Tienes el derecho incondicional a solicitar la eliminación total e irreversible de tu cuenta, historial de chats, registros de pagos y metadatos asociados.
  - La solicitud se procesa de forma directa vía soporte (`epochai210@gmail.com`), garantizando la destrucción física y lógica de los registros en un plazo máximo de **48 horas**.

---

## 🤖 4. Aviso Legal y Responsabilidad sobre IA

1. **Naturaleza Probabilística**: KODI AI Studio utiliza modelos de lenguaje probabilísticos de vanguardia. Aunque incorpora verificación web con Tavily AI y auditoría de librerías, el usuario reconoce que las respuestas generadas por IA pueden contener inexactitudes y deben ser validadas antes de desplegarse en entornos críticos de producción.
2. **Responsabilidad del Código Generado**: El desarrollador es el responsable final de auditar, compilar y probar cualquier algoritmo o script antes de integrarlo en sus sistemas.
3. **Autoría y Marca**: KODI AI Studio es un producto de software concebido, diseñado y desarrollado por **Jesús Morales Rodriguez** bajo la marca **Epoch**.

---

[⬅️ Anterior: Documentación de la API](./API.md) • [📖 Volver al Índice Principal](../README.md)
