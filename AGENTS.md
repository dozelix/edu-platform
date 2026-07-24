# AGENTS.md — edu-platform

## Qué es
Plataforma educativa de escritorio (Electron + React + MongoDB). Catálogo de cursos, inscripción, progreso, lecciones con comentarios y panel de instructores.

## Stack
- Electron 39 + React 18 (JSX) + Vite 8 + Tailwind v4
- MongoDB + Mongoose 8 (base `eduplatform`)
- IPC (preload.cjs) como pseudo-backend
- Vitest, Playwright (visual), ESLint, Prettier

## Comandos
```bash
pnpm dev              # Vite + Electron
pnpm dev:frontend     # solo Vite
pnpm build            # build frontend
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm test             # Vitest
pnpm shot             # Playwright capturas
pnpm approve-builds   # Permitir scripts de build (electron, etc.)
```

## Seed
```bash
mongosh "mongodb://localhost:27017" seeds/eduplatform.volume.seed.js
```

## Convenciones
- **Branches**: `feature/*` → `develop` → `main`
- **Commits**: conventional commits en español
- Login test: `alumno.test@edu.cl` / `profe.test@edu.cl` — pass: `edu12345`
- Seguridad: lista blanca de canales IPC en `preload.cjs`, CSP estricta en producción
- Docs principales: `docs/DOCUMENTACION.md`, `docs/ARQUITECTURA.md`, `docs/SETUP.md`
