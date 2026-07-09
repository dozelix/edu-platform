# Arquitectura — EduPlatform

EduPlatform es un monorepo de escritorio que combina Electron, React/Vite y MongoDB. El proceso principal de Electron actúa como backend local para la UI, y el renderer accede a los datos a través de un puente IPC muy restringido. La navegación no usa router: la aplicación alterna entre catálogo, aprendizaje, lección y panel de instructor mediante estado local en el componente principal.

## 1. Visión general

- Frontend: React 18 + Vite 8 + Tailwind v4.
- Escritorio: Electron 39 con un proceso principal que controla la ventana y la sesión.
- Persistencia: MongoDB con Mongoose 8.
- Autenticación: bcryptjs sobre la colección `usuarios`.
- Datos: el caso de uso se implementa sobre colecciones MongoDB con referencias, usando el seed de volumen para reproducir un entorno realista.

## 2. Estructura del proyecto

```text
packages/
  frontend/
    src/
      App.jsx                  # navegación por estado y estado global de la UI
      components/              # sidebar, topbar, login/register, etc.
      features/                # catálogo, aprendizaje, lección, instructor
      css/                     # estilos legacy + Tailwind
  main/
    src/
      index.js                # arranque de Electron, CSP, conexión a MongoDB
      preload.cjs             # puente IPC con whitelist
      session.js              # identidad de sesión del proceso main
      db/
        connection.js         # conexión a MongoDB (MONGODB_URI)
        models/Usuario.js     # modelo de usuarios con bcrypt
      ipc/
        authHandlers.js       # login, registro, logout
        courseHandlers.js     # catálogo y matrícula
        learningHandlers.js   # progreso y cursos del usuario
        lessonHandlers.js     # lecciones, comentarios y completado
        instructorHandlers.js # resumen del instructor
        dbHandlers.js         # estado de la conexión
scripts/
  seed-docker.sh              # seed via Docker
seeds/
  eduplatform.volume.seed.js  # seed de volumen con datos de prueba
```

## 3. Flujo de ejecución

1. El comando `npm run dev` levanta Vite en `http://localhost:5173` y luego lanza Electron.
2. El proceso principal de Electron carga el archivo `.env.local`, define la CSP por sesión, conecta a MongoDB y registra los handlers IPC.
3. El renderer carga la interfaz y consulta al proceso principal mediante `window.api.invoke(...)`.
4. El preload valida que el canal esté permitido y reenvía la llamada al proceso main.
5. Los handlers del proceso main consultan MongoDB con Mongoose y usan la sesión persistida en memoria para decidir la identidad del usuario activo.

## 4. Capa de frontend

La UI está implementada en React y no usa router. El componente principal en [packages/frontend/src/App.jsx](../packages/frontend/src/App.jsx) mantiene:

- `currentUser` para la sesión autenticada.
- `activeNav` para alternar entre catálogo, aprendizaje y lección.
- `activeLeccionId` para abrir una lección en contexto.
- `dbStatus` para mostrar si la base de datos está disponible.

La navegación para instructores se deriva del tipo de usuario: si el usuario autenticado es instructor, la app muestra el panel correspondiente en lugar de la experiencia de estudiante.

## 5. Capa de proceso principal

El proceso principal es responsable de:

- crear y gestionar la ventana principal de Electron;
- aplicar la Content-Security-Policy por sesión;
- cargar variables de entorno desde `.env.local`;
- abrir la conexión a MongoDB;
- registrar los handlers IPC;
- mantener la sesión del usuario activo en memoria.

El archivo [packages/main/src/index.js](../packages/main/src/index.js) concentra el arranque, mientras que [packages/main/src/preload.cjs](../packages/main/src/preload.cjs) actúa como único puente seguro hacia el renderer.

## 6. Canales IPC

El renderer solo puede invocar canales autorizados. Cada respuesta sigue el patrón `{ success, data }` o `{ success: false, error }`.

| Canal | Propósito |
| --- | --- |
| `auth:login`, `auth:register`, `auth:logout` | Autenticación y cierre de sesión. |
| `curso:listar` | Catálogo de cursos y marca de inscripción por usuario. |
| `inscripcion:crear` | Crear una inscripción en un curso. |
| `aprendizaje:listar` | Cursos, progreso y siguiente lección para el usuario actual. |
| `leccion:obtener`, `leccion:completar` | Obtener una lección y marcarla como completada. |
| `comentario:listar`, `comentario:crear` | Comentarios asociados a una lección. |
| `instructor:resumen` | Resumen para un instructor autenticado. |
| `db:estado` | Estado real de la conexión a MongoDB. |

## 7. Modelo de datos

El caso se modela con colecciones MongoDB por referencias, siguiendo la transformación del esquema relacional original.

- `usuarios`: datos de usuarios, con `tipo` (`estudiante` o `instructor`) y password hasheado con bcrypt.
- `cursos`: curso, instructor asociado y precio/calificación.
- `lecciones`: contenido en Markdown, video y duración.
- `inscripciones`: matrícula de un estudiante en un curso y progreso.
- `comentarios`: comentarios por lección.
- `calificaciones`: puntajes por lección (si se usan en el seed).

La lógica de progreso se deriva de `lecciones_completadas` y del total de lecciones del curso. Los índices principales incluyen `usuarios.email`, `cursos.instructor_id`, `lecciones.curso_id`, `inscripciones.usuario_id` y el compuesto `{ usuario_id, curso_id }`.

## 8. Decisiones de diseño relevantes

- Se evita confiar en el renderer para identificar al usuario activo: la identidad real se toma de la sesión del proceso main.
- Se usa acceso directo a `mongoose.connection.db.collection(...)` para leer datos del seed y mantener compatibilidad con campos legacy del caso.
- Las lecciones se presentan como Markdown renderizado en la UI, sin usar `dangerouslySetInnerHTML`.
- La experiencia es de una sola ventana y la sesión vive en memoria del proceso main, lo que es suficiente para el uso local de escritorio pero no para un despliegue multiusuario/servidor.

## 9. Build y empaquetado

- Desarrollo: `npm run dev`.
- Frontend standalone: `npm run dev:frontend`.
- Build web: `npm run build`.
- Empaquetado Electron: el proyecto está preparado para generar un bundle con Electron Builder usando la configuración del archivo [package.json](../package.json).

La política de seguridad y las limitaciones actuales se documentan en [SECURITY.md](../SECURITY.md).
