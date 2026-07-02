# EduPlatform

Plataforma educativa de escritorio construida con Electron, React y MongoDB. Implementa el Caso 3:
catálogo de cursos, inscripción, seguimiento de progreso, lecciones con comentarios y un panel para
que los instructores vean quién está aprendiendo.

## Descripción general

- Frontend: React 18 (JSX) con Vite 8 y Tailwind v4 (tema claro tipo Udemy).
- Backend: proceso principal de Electron como pseudo-backend, vía IPC (`window.api`).
- Base de datos: MongoDB con Mongoose 8 (base `eduplatform`).
- Distribución: Electron para escritorio; build web publicable en GitHub Pages.

### Funcionalidades

- Login de estudiantes e instructores (bcrypt).
- Catálogo: grid con nombre, instructor, precio y calificación; búsqueda por nombre; filtro por
  instructor; inscribirse solo si no está inscrito; precio en varias monedas (API pública).
- Mi Aprendizaje: progreso por curso, última lección y continuar aprendiendo.
- Lección: video (si existe), contenido en Markdown, duración, últimos 5 comentarios, agregar
  comentario, marcar como completada y siguiente lección.
- Panel de instructor: sus cursos, estudiantes inscritos y progreso real.

## Stack

| Capa | Tecnologías |
|------|-------------|
| Escritorio | Electron 39, Electron Builder |
| Frontend | React 18 (JSX), Vite 8 |
| Estilos | Tailwind v4 + lucide-react |
| Backend | Node.js, Electron IPC (pseudo-backend) |
| Base de datos | MongoDB, Mongoose 8 |
| Calidad | ESLint, Prettier, Vitest |

## Instalación y uso

```bash
git clone https://github.com/dozelix/EduPlataform.git
cd EduPlataform
npm install

# Con MongoDB corriendo en localhost:27017, sembrar la base:
mongosh "mongodb://localhost:27017" < seeds/eduplatform.volume.seed.js

# Iniciar Vite + Electron:
npm run dev
```

Login de prueba (contraseña `edu12345`): estudiante `alumno.test@edu.cl`, docente/instructor
`profe.test@edu.cl`.

Guía completa en [docs/SETUP.md](docs/SETUP.md).

## Scripts

```bash
npm run dev            # Vite (:5173) + Electron
npm run dev:frontend   # solo Vite
npm run build          # build de producción del frontend
npm run lint           # ESLint
npm run format         # Prettier
npm run test           # Vitest
npm run shot           # verificación visual con Playwright (capturas)
```

## Documentación

| Documento | Propósito |
|-----------|-----------|
| [docs/DOCUMENTACION.md](docs/DOCUMENTACION.md) | Visión del proyecto y correspondencia con la pauta del Caso 3. |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Estructura, modelo de datos, canales IPC y seguridad. |
| [docs/SETUP.md](docs/SETUP.md) | Instalación, seed y ejecución. |
| [SECURITY.md](SECURITY.md) | Política de seguridad y limitaciones conocidas. |

La pauta oficial del caso está en `docs/docs_ev/`.

## Seguridad

- Lista blanca de canales IPC en el puente `preload.cjs`.
- Content-Security-Policy por sesión (estricta en producción).
- Identidad desde la sesión del proceso main: los handlers IPC no confían en el id del renderer.
- La app no se cierra si falla la base de datos: muestra el error en las vistas.

Detalle en [SECURITY.md](SECURITY.md).

## Licencia

Proyecto privado. Consultar con los mantenedores para permisos de uso.
