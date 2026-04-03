# Griego Bíblico Koiné — Curso Interactivo

Plataforma de autoinstrucción para aprender griego bíblico (κοινή) desde nivel principiante absoluto hasta exégesis avanzada. Basado en fuentes académicas clásicas: Robertson, Blass-Debrunner, Dana-Mantey, Merkle, Porter, y Kittel/Coenen.

## Características

- 🎓 **44 lecciones** organizadas en 4 niveles progresivos
- 📊 **Ejercicios interactivos**: selección múltiple, completar texto, paradigmas, traducción
- 📈 **Sistema de progreso** persistente: racha diaria, puntajes, estadísticas
- 🔤 **Diagramas sintácticos** interactivos (SVG)
- 📖 **Análisis de textos bíblicos reales** con parsing morfológico
- 💾 **Offline ready**: todo funciona en localStorage

## Estructura del Curso

### Nivel 1 — Fundamentos (12 lecciones)
Alfabeto, fonética, morfología nominal, introducción al verbo.

### Nivel 2 — Morfología Verbal (12 lecciones)
Sistema verbal completo: tiempos, voces, modos, participios, infinitivos.

### Nivel 3 — Sintaxis y Análisis (10 lecciones)
Estructura de la oración griega, análisis del discurso, diagramación.

### Nivel 4 — Exégesis y Crítica Textual (10 lecciones)
Crítica textual, método exegético, análisis de manuscritos.

## Tecnologías

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- JSON estático para lecciones y contenido
- localStorage para persistencia
- SVG para diagramas interactivos

## Desarrollo Local

```bash
# Requiere servidor HTTP local (restricción de fetch con file://)
npx serve .
# O con Python:
python3 -m http.server 8000

# Luego abre en navegador:
http://localhost:8000
```

## Estructura de Archivos

```
griego-biblico/
├── index.html              # SPA principal
├── css/                    # Estilos
├── js/                     # JavaScript
│   ├── core/              # Store, progreso, router, utils
│   ├── componentes/       # Componentes reutilizables
│   └── vistas/            # Vistas principales
├── datos/                 # JSON de lecciones y contenido
└── assets/                # Fuentes, imágenes
```

## Licencia

Creado por Carlos Caamaño Espinoza. Fuentes académicas citadas según sus publicaciones originales.
