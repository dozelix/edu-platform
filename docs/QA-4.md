# Informe de QA — EduPlatform v2.0.0

**Fecha:** 2026-07-07
**Alcance:** Revisión funcional completa del código fuente (backend + frontend + CSS + tests + config)

---

## Resumen Ejecutivo

| Métrica | Valor |
|---|---|
| Archivos revisados | 75 (todo el proyecto) |
| Bugs confirmados | 1 (medio) |
| Problemas menores | 4 (bajo) |
| Hallazgos de seguridad | 0 |
| Tests unitarios | 2 archivos, 10 casos |
| Cobertura de tests | Baja (solo utilidades aisladas) |

---

## Bugs Confirmados

### B1 — Variable `progreso` no definida en `leccion:completar`

**Archivo:** `packages/main/src/ipc/lessonHandlers.js:142`
**Severidad:** Media
**Síntomas:** El handler `leccion:completar` retorna `{ progreso, completada: true }` pero la variable `progreso` no está definida en ningún ámbito. El pipeline de agregación de MongoDB (`$set`) actualiza el campo en la base de datos, pero el valor calculado no se captura para devolverlo al renderer. El frontend recibe `undefined` para `progreso`.

**Impacto:** La UI no recibe el progreso actualizado después de completar una lección. El progreso sí se persiste correctamente en MongoDB, pero el estado local del renderer queda desactualizado hasta el próximo refresh.

**Solución propuesta:**
```js
// En lugar de:
return { success: true, data: { progreso, completada: true } }

// Usar el resultado del update:
const result = await db.collection('inscripciones').findOneAndUpdate(...)
return { success: true, data: { progreso: result.progreso, completada: true } }
```

---

## Problemas Menores

### M1 — Inline `fontFamily` en InstructorDashboard

**Archivo:** `packages/frontend/src/features/instructor/InstructorDashboard.jsx:98`
**Detalle:** Se usa `style={{ fontFamily: "'Inter', sans-serif" }}` en lugar de la variable CSS `var(--font-body)` definida en `index.css:41`. Inconsistencia con el resto de la app que usa las variables de diseño.

### M2 — Componente Barra con dos modos de renderizado

**Archivo:** `packages/frontend/src/components/common/Barra.jsx`
**Detalle:** El flag `isCustomCss` bifurca entre CSS nativo (`.lrn-progress`) y estilos inline Tailwind. Esto añade complejidad innecesaria. Sugerencia: unificar usando siempre las clases CSS compartidas (`.progress-track` / `.progress-fill` de `index.css`).

### M3 — Error de inscripción silenciado en App.jsx

**Archivo:** `packages/frontend/src/App.jsx:58-61`
**Detalle:** El `catch` vacío en `enrollCourse` traga cualquier error. Si la inscripción falla (curso inexistente, error de red), el usuario no recibe feedback. Sugerencia: al menos un `console.warn` o mostrar un toast/notificación al usuario.

### M4 — Sin cobertura de tests para handlers IPC ni componentes principales

**Detalle:** Solo existen tests para `formatearPrecio`, `portadaDeCurso` y `ErrorBoundary`. Los 6 handlers IPC, la lógica de sesión, los componentes de vista (MyLearning, Lesson, etc.) y la integración con MongoDB no tienen tests automatizados.

---

## Seguridad

| Aspecto | Estado |
|---|---|
| `contextIsolation: true` | ✅ |
| `nodeIntegration: false` | ✅ |
| CSP estricta en producción | ✅ |
| Whitelist de canales IPC en preload | ✅ |
| Sesión del lado del main (no confía en renderer) | ✅ |
| Validación de IDs (ObjectId) en todos los handlers | ✅ |
| bcrypt para contraseñas | ✅ |
| Sanitización de enlaces en Markdown | ✅ |
| Sin secretos hardcodeados (usa `.env`) | ✅ |

No se encontraron vulnerabilidades. El modelo de seguridad IPC es sólido.

---

## Estructura del Proyecto

### Backend (Electron Main Process)

| Archivo | Líneas | Estado |
|---|---|---|
| `src/index.js` | 136 | ✅ Correcto |
| `src/preload.cjs` | 28 | ✅ Correcto |
| `src/session.js` | 22 | ✅ Correcto |
| `src/db/connection.js` | 37 | ✅ Correcto |
| `src/db/models/Usuario.js` | — | ✅ Correcto |
| `src/ipc/authHandlers.js` | 103 | ✅ Correcto |
| `src/ipc/courseHandlers.js` | 53 | ✅ Correcto |
| `src/ipc/learningHandlers.js` | 147 | ✅ Correcto |
| `src/ipc/lessonHandlers.js` | 225 | ⚠️ Bug B1 |
| `src/ipc/instructorHandlers.js` | 104 | ✅ Correcto |
| `src/ipc/dbHandlers.js` | 8 | ✅ Correcto |

### Frontend (React + Vite)

| Archivo | Líneas | Estado |
|---|---|---|
| `src/Main.jsx` | 14 | ✅ Correcto |
| `src/App.jsx` | 184 | ✅ Correcto |
| `src/components/Sidebar.jsx` | 98 | ✅ Correcto |
| `src/components/Topbar.jsx` | 46 | ✅ Correcto |
| `src/components/LoginRegister.jsx` | — | ✅ Correcto |
| `src/components/ErrorBoundary.jsx` | — | ✅ Correcto |
| `src/components/common/Barra.jsx` | 38 | ⚠️ M2 |
| `src/components/common/Estrellas.jsx` | 21 | ✅ Correcto |
| `src/components/icons/Icons.jsx` | 102 | ✅ Correcto |
| `src/features/courses/Catalog.jsx` | — | ✅ Correcto |
| `src/features/learning/MyLearning.jsx` | 135 | ✅ Correcto |
| `src/features/lesson/Lesson.jsx` | — | ✅ Correcto |
| `src/features/lesson/Markdown.jsx` | 39 | ✅ Correcto |
| `src/features/instructor/InstructorDashboard.jsx` | 212 | ⚠️ M1 |

### CSS

| Archivo | Líneas | Estado |
|---|---|---|
| `tailwind.css` | 13 | ✅ Correcto |
| `index.css` | 326 | ✅ Correcto (tokens, reset, utilidades) |
| `Dashboard.css` | 635 | ✅ Correcto (sidebar, topbar, layout) |
| `Catalog.css` | 212 | ✅ Correcto |
| `MyLearning.css` | 108 | ✅ Correcto |
| `Lesson.css` | 254 | ✅ Correcto |

### Tests

| Archivo | Casos | Estado |
|---|---|---|
| `Catalog.test.js` | 7 | ✅ Correcto |
| `ErrorBoundary.test.jsx` | 1 | ✅ Correcto |

---

## Recomendaciones

1. **Corregir B1** — `progreso` undefined en `leccion:completar` antes del primer release.
2. **Aumentar cobertura de tests** — Priorizar tests para los 6 handlers IPC y los componentes de vista principales (Catalog, MyLearning, Lesson).
3. **Unificar Barra.jsx** — Eliminar el flag `isCustomCss` y usar siempre las clases compartidas de `index.css`.
4. **Feedback al usuario** — No tragar errores silenciosamente en `enrollCourse`.
5. **Considerar TypeScript** para futura refactorización, dado el tamaño del proyecto.
6. **Test de integración Electron** — Agregar un test smoke que verifique que la app inicia y los canales IPC responden.
