# SECURITY: Seguridad, Privacidad y T茅rminos de Servicio

En **Epoch**, la seguridad de los datos y el derecho inalienable a la privacidad digital constituyen pilares no negociables en el dise帽o de **KODI AI Studio**.

---

## 馃敀 1. Principios Fundamentales de Seguridad

- **Cifrado en Tr谩nsito y en Reposo**: Todas las comunicaciones entre el cliente (Web / APK) y los servidores de Epoch se realizan obligatoriamente bajo canales cifrados TLS 1.3. Las credenciales y datos almacenados en base de datos emplean cifrado AES-256.
- **Validaci贸n Estricta de Entradas**: Cada endpoint de la API implementa esquemas declarativos con la librer铆a **Zod**, previniendo ataques de inyecci贸n SQL, Cross-Site Scripting (XSS) e inyecci贸n de comandos en el int茅rprete de c贸digo.
- **Aislamiento de Entornos de Ejecuci贸n (Sandboxing)**: La ejecuci贸n de c贸digo en Python, JavaScript o Bash se ejecuta en contenedores con privilegios m铆nimos, sin acceso a la red interna ni a las credenciales del sistema anfitri贸n.

---

## 馃摐 2. Pol铆tica de Privacidad (GDPR & CCPA Compliant)

### 2.1 Datos que Recopilamos
- **Informaci贸n de Cuenta**: Correo electr贸nico, nombre de usuario configurado y fecha de registro.
- **Datos de Uso**: Metadatos de uso de modelos (tokens consumidos, timestamp y modelo seleccionado) para control de cuota y tarificaci贸n.
- **Contenido de Conversaciones**: Los mensajes se transmiten para inferencia en tiempo real. **Epoch NO vende, no comercializa ni utiliza el contenido de tus chats para entrenar modelos p煤blicos de inteligencia artificial**.

### 2.2 Base Legal del Tratamiento
Procesamos tus datos bajo el consentimiento expl铆cito otorgado al crear tu cuenta, y bajo la necesidad contractual para entregarte el servicio de IA solicitado (Art铆culo 6(1)(b) del RGPD).

---

## 鈿栵笍 3. Derechos del Usuario y Eliminaci贸n de Datos (48 Horas)

En estricto cumplimiento con el Reglamento General de Protecci贸n de Datos (GDPR) de la Uni贸n Europea y la Ley de Privacidad del Consumidor de California (CCPA):

- **Derecho de Acceso y Portabilidad**: Puedes exportar tu historial completo de conversaciones en formato JSON en cualquier momento desde el panel de Configuraci贸n.
- **Derecho al Olvido (Eliminaci贸n Definitiva en 48 Horas)**:
  - Tienes derecho a solicitar el borrado integral e irreversible de toda tu cuenta, historial de chats, registros de facturaci贸n y logs asociados.
  - La solicitud se procesa de forma automatizada o v铆a soporte t茅cnico, garantizando la destrucci贸n f铆sica/l贸gica de los registros en un plazo m谩ximo de **48 horas**.

---

## 馃 4. Aviso Legal sobre Inteligencia Artificial

1. **Naturaleza Probabil铆stica**: KODI AI Studio utiliza modelos de lenguaje probabil铆sticos de 煤ltima generaci贸n. Aunque incorpora verificaci贸n web con Tavily y auditor铆a de librer铆as, el usuario reconoce que las respuestas de IA pueden contener inexactitudes y deben ser validadas antes de su despliegue en entornos cr铆ticos de producci贸n.
2. **Responsabilidad del C贸digo Generado**: El desarrollador es el responsable final de auditar, compilar y verificar cualquier algoritmo o script generado por KODI antes de integrarlo en sus sistemas.
3. **Creador y Autor铆a**: KODI AI Studio es un producto de software concebido, dise帽ado y desarrollado por **Jes煤s Morales Rodriguez** bajo la marca digital **Epoch**.

[Siguiente: Hoja de Ruta Tecnol贸gica 鉃擼(./ROADMAP.md)
