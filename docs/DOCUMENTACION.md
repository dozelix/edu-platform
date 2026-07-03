# EduPlatform — Documentación del proyecto

Aplicación de escritorio (Electron + React + MongoDB) que implementa el Caso 3: una plataforma
de cursos online donde estudiantes encuentran cursos, se inscriben, siguen su progreso y comentan
las lecciones, y donde los instructores ven quién está aprendiendo.

Documentos de esta carpeta:
- [SETUP.md](SETUP.md) — instalar, sembrar la base y correr la app.
- [ARQUITECTURA.md](ARQUITECTURA.md) — estructura, modelo de datos, canales IPC y seguridad.

## Vistas y su correspondencia con la pauta

La pauta oficial está en `docs/docs_ev/CASO_3_EduPlatform_Requerimientos_Frontend.pdf`.

| Vista (pauta) | Qué hace | Dónde |
|---|---|---|
| 1. Login | Autenticación de estudiantes e instructores (bcrypt). | `components/LoginRegister.jsx`, `ipc/authHandlers.js` |
| 2. Catálogo | Grid con nombre, instructor, precio y calificación; búsqueda por nombre; filtro por instructor; botón Inscribirse solo si no está inscrito. | `features/courses/Catalog.jsx`, `ipc/courseHandlers.js` |
| 3. Mi Aprendizaje | Tabla con curso, instructor, progreso (%), última lección; barra de progreso; botón Continuar aprendiendo. | `features/learning/MyLearning.jsx`, `ipc/learningHandlers.js` |
| 4. Lección | Video (si existe), contenido en Markdown, duración, últimos 5 comentarios, agregar comentario, marcar como completada, siguiente lección. | `features/lesson/Lesson.jsx`, `features/lesson/Markdown.jsx`, `ipc/lessonHandlers.js` |
| API pública | Conversor de monedas: el precio se muestra en varias monedas usando tasas de una API pública. | `features/courses/Catalog.jsx` (`open.er-api.com`) |
| Instructor | Panel con sus cursos, estudiantes inscritos y progreso real, scopeado por instructor. | `features/instructor/InstructorDashboard.jsx`, `ipc/instructorHandlers.js` |

## Estado

- Las cuatro vistas, el conversor de monedas y el panel de instructor están implementados y
  verificados en la interfaz real.
- El contenido de la lección se renderiza desde Markdown con un componente propio (sin
  dependencias externas y sin `dangerouslySetInnerHTML`).
- Endurecimiento aplicado: lista blanca de canales IPC, Content-Security-Policy, identidad desde la
  sesión del proceso main (los handlers no confían en el id que envía el renderer), y la app no se
  cierra si falla la base de datos.
- Pruebas automáticas con Vitest (`npm run test`).

## Material del caso

En `docs/docs_ev/` está la pauta oficial:

| Archivo | Qué es |
|---|---|
| `CASO_3_EduPlatform_Requerimientos_Frontend.pdf` | Requisitos de frontend (las 4 vistas + conversor de monedas). |
| `CASO_3_EduPlatform_schema.sql` | Modelo relacional de origen, transformado a NoSQL (ver [ARQUITECTURA.md](ARQUITECTURA.md)). |
| `CASO_3_EduPlatform_mongodb_existente.js` | Mongo mínimo con inconsistencias intencionales (datos huérfanos). |

Ante discrepancias, manda el código y la base real, luego el material del caso, y por último estos documentos.

## Credenciales de prueba

Base sembrada con el seed de volumen (contraseña `edu12345`). Las dos cuentas de testeo son:

- Estudiante: `alumno.test@edu.cl`
- Docente (instructor): `profe.test@edu.cl`
