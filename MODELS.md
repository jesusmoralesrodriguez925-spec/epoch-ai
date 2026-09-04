```markdown
# MODELS: Especificación y Guía de Modelos KODI
> **KODI AI Studio by Jesús Morales Rodriguez**  
> **Producto**: KODI AI Studio v1.0  
> **Creador**: Jesús Morales Rodriguez  

KODI AI Studio incorpora tres arquitecturas complementarias diseñadas para ofrecer un equilibrio óptimo entre velocidad de ejecución, profundidad de razonamiento y ventana de contexto masiva.

---

## 🔬 1. Catálogo Técnico de Modelos

### 1.1 KODI Nova Core 2.1
- **Proveedor Base**: Google Gemini API
- **Especialización**: Análisis conceptual, redacción literaria y técnica, lógica general y resolución de dudas.
- **Velocidad de Inferencia**: Media (~1.5s a 3.0s primer token).
- **Ventana de Contexto**: Más de 100,000 tokens.
- **Casos de Uso Recomendados**:
  - Resúmenes de documentos técnicos, PDFs y literatura científica.
  - Explicaciones didácticas paso a paso para estudiantes e investigadores.
  - Redacción de informes ejecutivos, documentación y traducciones idiomáticas.

### 1.2 KODI Omniscient 3.0
- **Proveedor Base**: Groq LPU Engine (Llama 3.3 70B Versatile)
- **Especialización**: Generación y depuración de código en tiempo real, latencia ultrabaja.
- **Velocidad de Inferencia**: Ultrarrápida (menos de 400ms por respuesta).
- **Ventana de Contexto**: 32,000 tokens.
- **Casos de Uso Recomendados**:
  - Pair programming en vivo y corrección inmediata de errores de sintaxis.
  - Consultas tipo terminal: comandos Bash, expresiones regulares y consultas SQL.
  - Tareas repetitivas que demandan máxima agilidad sin tiempos de espera.

### 1.3 KODI Max Engineering 4.5
- **Proveedor Base**: Google Gemini Pro Advanced
- **Especialización**: Ingeniería de software integral, auditoría de seguridad y análisis de repositorios completos.
- **Velocidad de Inferencia**: Profunda (~3s a 5s con cadena de razonamiento activa).
- **Ventana de Contexto**: Más de 1,000,000 de tokens.
- **Casos de Uso Recomendados**:
  - Ingesta y análisis de proyectos enteros con múltiples directorios y módulos.
  - Diseño de esquemas de bases de datos distribuidas y microservicios escalables.
  - Auditoría forense de vulnerabilidades, refactorización y optimización de rendimiento.

---

## 📊 2. Matriz Comparativa de Modelos

| Criterio | KODI Nova Core 2.1 | KODI Omniscient 3.0 | KODI Max Engineering 4.5 |
| :--- | :--- | :--- | :--- |
| **Enfoque Principal** | General / Redacción / Lógica | Código rápido / Terminal | Ingeniería compleja / Big Context |
| **Tiempo de Respuesta** | 1.5 - 3.0 segundos | < 0.4 segundos | 3.0 - 5.0 segundos |
| **Ventana de Tokens** | 100,000+ | 32,000 | 1,000,000+ |
| **Capacidad Multimodal** | Texto + Documentos | Código / Texto puro | Código masivo / Datos / Docs |
| **Consumo de Solicitudes** | Estándar (1x) | Rápido (1x) | Especializado (2x) |

---

## 💡 3. Guía de Decisión: ¿Cuándo usar cada modelo?

```text
¿Cuál es la prioridad de tu consulta?
  │
  ├── ¿Velocidad instantánea para programar o depurar?
  │     └── ➔ Selecciona: KODI Omniscient 3.0 (<400ms)
  │
  ├── ¿Proyecto masivo, repositorio completo o >50k tokens?
  │     └── ➔ Selecciona: KODI Max Engineering 4.5 (1M tokens)
  │
  └── ¿Redacción general, análisis conceptual o aprendizaje?
        └── ➔ Selecciona: KODI Nova Core 2.1 (Equilibrado)

🛠️ 4. Ejemplos de Prompting por Modelo
KODI Nova Core 2.1
Actúa como un profesor de informática teórica. Explica la diferencia entre complejidad temporal O(n log n) y O(n^2) usando una analogía visual accesible.

KODI Omniscient 3.0
Escribe un script en Bash para monitorear el uso de CPU y memoria cada 5 segundos y registrar en un archivo CSV cualquier consumo superior al 80%.

KODI Max Engineering 4.5
Analiza la siguiente arquitectura de microservicios con PostgreSQL, Redis y Docker. Identifica cuellos de botella bajo alta concurrencia y propón una estrategia de particionado horizontal (sharding) con scripts de migración.

⬅️ Anterior: Guía de Inicio Rápido • Siguiente: Arquitectura Técnica del Sistema ➔
