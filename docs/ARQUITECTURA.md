# Arquitectura — EduPlatform

Monorepo Electron + React + MongoDB. El proceso principal de Electron actúa como pseudo-backend:
la interfaz React (renderer) pide datos por IPC a través de un puente seguro (`window.api`), y los
handlers del proceso main consultan MongoDB con Mongoose.

## Estructura

```
packages/frontend/src/
├── main.jsx                 monta <App>; importa tailwind.css y main.css
├── app.jsx                  navegación por estado (login / shell / panel instructor)
├── components/
│   ├── LoginRegister.jsx    Vista 1 (auth:login / auth:register)
│   ├── Sidebar.jsx          navegación e indicador de estado de BD
│   └── Topbar.jsx           barra superior (login / usuario)
└── features/
    ├── courses/Catalog.jsx          Vista 2 (catálogo + conversor de monedas)
    ├── learning/MyLearning.jsx      Vista 3 (progreso)
    ├── lesson/Lesson.jsx            Vista 4 (reproductor + comentarios)
    ├── lesson/Markdown.jsx          render de Markdown seguro (sin HTML crudo)
    └── instructor/InstructorDashboard.jsx   panel del instructor

packages/main/src/
├── index.js                 arranque: CSP, connectDB, ventana y carga de handlers
├── preload.cjs              puente IPC (window.api) con lista blanca de canales
├── db/connection.js         conexión a .env.local
├── db/models/Usuario.js     colección `usuarios` (bcrypt)
├── session.js               sesión del proceso main (identidad para los handlers)
└── ipc/                     authHandlers, courseHandlers, learningHandlers,
                             lessonHandlers, instructorHandlers, dbHandlers

seeds/                                eduplatform.seed.js (mínimo/huérfanos), eduplatform.volume.seed.js
```

## Canales IPC

El renderer solo puede invocar los canales de la lista blanca (`preload.cjs`); cualquier otro se
rechaza. Cada canal responde `{ success, data }` o `{ success: false, error }`.

| Canal | Propósito |
|---|---|
| `auth:login`, `auth:register`, `auth:logout` | Autenticación (bcrypt). |
| `curso:listar` | Catálogo, con marca de inscripción para el usuario. |
| `inscripcion:crear` | Inscribir a un curso. |
| `aprendizaje:listar` | Cursos del usuario con progreso y última lección. |
| `leccion:obtener`, `leccion:completar` | Lección y avance (recalcula progreso). |
| `comentario:listar`, `comentario:crear` | Últimos 5 comentarios y alta de comentario. |
| `instructor:resumen` | Cursos, estudiantes y progreso del instructor. |
| `db:estado` | Estado real de la conexión a MongoDB (para el indicador del sidebar). |

## Modelo de datos (NoSQL por referencias)

Transformación del esquema relacional de origen (`docs/docs_ev/CASO_3_EduPlatform_schema.sql`)
a documentos con referencias (no embebidos) por la alta cardinalidad (100 cursos, ~1000 usuarios).

```
usuarios:      { _id, email, nombre, tipo: 'estudiante'|'instructor', password (bcrypt),
                 fecha_registro, bio, especialidades }   // bio/especialidades solo instructores
cursos:        { _id, nombre, descripcion, instructor_id -> usuarios._id, fecha_inicio,
                 precio, portada_url, estado, calificacion }
lecciones:     { _id, curso_id -> cursos._id, numero, orden, titulo, contenido_text (Markdown),
                 video_url, duracion_minutos }
inscripciones: { _id, usuario_id, curso_id, fecha_inscripcion, estado, progreso,
                 lecciones_completadas: [leccion._id] }
comentarios:   { _id, leccion_id, usuario_id, texto, fecha }
calificaciones:{ _id, usuario_id, leccion_id, puntaje, fecha }
```

`progreso` se deriva de `lecciones_completadas` / total de lecciones del curso, consistente con lo
que recalcula `leccion:completar`.

Índices: `usuarios.email` (único), `cursos.instructor_id`, `lecciones.curso_id`,
`inscripciones.usuario_id` y `{usuario_id, curso_id}` (único), `comentarios.leccion_id`,
`calificaciones.{usuario_id, leccion_id}`.

## Decisiones de diseño

- **Tema tipo Udemy.** Tokens `--color-*` en `styles/index.css` (primario `#3b1c8c`, acento
  `#a435f0`, fondo `#f7f9fa`, texto `#1c1d1f`, borde `#d1d7dc`, fuente Inter).
- **Tailwind v4 + CSS heredado en capas.** El CSS plano va en la capa `legacy`; las utilidades de
  Tailwind ganan en las vistas nuevas. Preflight activo.
- **Navegación por estado.** `app.jsx` usa `useState` (`activeNav`, `activeLeccionId`); sin router.
- **Lectura null-safe.** El seed mínimo trae datos huérfanos a propósito; los handlers resuelven los
  joins de forma defensiva ("Instructor desconocido", "Curso no disponible") para no romper la UI.

## Seguridad

- **Lista blanca de canales IPC** en `preload.cjs`: el renderer solo llama canales conocidos.
- **Content-Security-Policy** por sesión (`index.js`): estricta en producción; en desarrollo se
  relaja para el HMR de Vite. Habilita solo los orígenes usados (Google Fonts, imágenes de Unsplash,
  API de monedas, media https).
- **Fallo de BD no fatal:** si MongoDB no conecta, la ventana se abre y las vistas muestran el error,
  en lugar de cerrar el proceso.
- El contenido de lección (dato externo) se renderiza como Markdown sin `dangerouslySetInnerHTML`.

Detalle y limitaciones conocidas en [../SECURITY.md](../SECURITY.md).
