# Estado del Proyecto — Caso 3: EduPlatform

Plataforma de cursos (Electron + React + MongoDB) que implementa las 4 vistas del Caso 3 sobre
la base `eduplatform` existente, con un tema claro tipo Udemy.

> Nota: este archivo reemplaza un backlog antiguo que describía un proyecto distinto (panel admin,
> RBAC, JWT, etc.) que no corresponde al Caso 3.

---

## Hecho (cubre el requerimiento del PDF)

- [x] **Vista 1 — Login**: `auth:login` contra la colección `usuarios` (bcrypt). Tipos estudiante/instructor.
- [x] **Vista 2 — Catálogo**: lista de cursos desde Mongo, filtro por instructor, búsqueda por nombre,
      botón "Inscribirse" (solo si no inscrito) y conversor de monedas (API pública).
- [x] **Vista 3 — Mi Aprendizaje**: tabla con cursos del usuario, progreso, última lección y "Continuar".
- [x] **Vista 4 — Lección**: video, contenido/duración (con fallback), últimos 5 comentarios,
      agregar comentario, marcar como completada (recalcula progreso) y siguiente lección.
- [x] **Datos huérfanos del seed** manejados null-safe en cada vista.
- [x] **Rediseño tipo Udemy** (Tailwind v4 + tema claro) en todas las vistas.
- [x] **Limpieza**: eliminado el andamiaje heredado (landing, dashboard, DBTester, CRUD `user:*`,
      CSS muerto).

## Límites del dato del seed (no son tareas pendientes)

El seed no trae `calificacion` de curso ni `contenido`/`duracion` de lección → se muestran como
"Sin calificación" / "Sin contenido" / "—".

## Opcional / mejoras

- [ ] Pulir las tarjetas del Catálogo más al estilo de la referencia (miniatura, estrellas, precio).
- [ ] Persistencia de sesión y whitelist de canales IPC (ver [SECURITY.md](SECURITY.md)).
- [ ] Merge de la rama de rediseño (`feature/ui-udemy`) a `develop`.

---

**Credenciales de prueba**: `estudiante1@edu.cl` / `instructor1@edu.cl`, contraseña `edu12345`.
