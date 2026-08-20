# EduPlatform

Plataforma educativa de escritorio construida con Electron, React, TypeScript y MongoDB. Implementa el Caso 3: catálogo de cursos, inscripción, seguimiento de progreso, lecciones con comentarios y un panel para que los instructores vean quién está aprendiendo.

## Descripción general

- Frontend: React 18 con TypeScript (`.tsx`), Vite 8 y Tailwind v4 (tema claro tipo Udemy).
- Backend: Proceso principal de Electron en TypeScript (`.ts`), vía IPC (`window.api`).
- Base de datos: MongoDB con Mongoose 8 (base `eduplatform`).
- Distribución: Electron para escritorio; build web publicable en GitHub Pages.
- Seguridad y gestión: Migrado a **pnpm** para mayor seguridad de dependencias y control de supply-chain.

### Funcionalidades

- Login de estudiantes e instructores (bcrypt).
- Catálogo: grid con nombre, instructor, precio y calificación; búsqueda por nombre; filtro por instructor; inscripción segura; conversión de monedas (API pública).
- Mi Aprendizaje: progreso por curso, última lección y continuar aprendiendo.
- Lección: video, contenido en Markdown tipado, duración, comentarios, marcar como completada y navegación entre lecciones.
- Panel de instructor: cursos propios, estudiantes inscritos y progreso real.

## Stack

| Capa | Tecnologías |
| ------ | ------------- |
| Escritorio | Electron 39, Electron Builder, TypeScript |
| Frontend | React 18, TypeScript, Vite 8, Tailwind v4 |
| Backend | Node.js, Electron IPC, TypeScript |
| Base de datos | MongoDB, Mongoose 8 |
| Calidad | ESLint, Prettier, Vitest (TypeScript) |

## Instalación y uso

```bash
git clone https://github.com/dozelix/edu-platform.git
cd edu-platform
pnpm install
```

Con MongoDB corriendo en `localhost:27017`, sembrar la base:
```bash
mongosh "mongodb://localhost:27017" seeds/eduplatform.volume.seed.js
```

Iniciar Vite + Electron:
```bash
pnpm dev
```

Login de prueba (contraseña `edu12345`): estudiante `alumno.test@edu.cl`, instructor `profe.test@edu.cl`.

Guía completa en [docs/SETUP.md](docs/SETUP.md).

## Scripts

```bash
pnpm dev            # Vite (:5173) + Electron (TypeScript)
pnpm dev:frontend   # Solo Vite frontend
pnpm build          # Build de producción (main + frontend)
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm test           # Vitest
```

## Documentación

| Documento | Propósito |
| ----------- | ----------- |
| [docs/DOCUMENTACION.md](docs/DOCUMENTACION.md) | Visión del proyecto y correspondencia con la pauta del Caso 3. |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Estructura, modelo de datos, canales IPC y seguridad. |
| [docs/SETUP.md](docs/SETUP.md) | Instalación, seed, pnpm y ejecución. |
| [SECURITY.md](SECURITY.md) | Política de seguridad y limitaciones conocidas. |

La pauta oficial del caso está en `docs/docs_ev/`.

## Seguridad

- Gestión de dependencias auditada con **pnpm**.
- Lista blanca de canales IPC en el puente `preload.cjs`.
- Content-Security-Policy por sesión (estricta en producción).
- Identidad desde la sesión del proceso main.

Detalle en [SECURITY.md](SECURITY.md).

## Licencia

Proyecto privado. Consultar con los mantenedores para permisos de uso.
