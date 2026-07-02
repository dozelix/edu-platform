# Setup — EduPlatform

## Requisitos

- Node.js v18 o superior
- MongoDB corriendo en `localhost:27017` (o accesible por `MONGODB_URI`)
- Git

## 1. Clonar e instalar

```bash
git clone https://github.com/dozelix/EduPlataform.git
cd EduPlataform
npm install
```

`npm install` usa workspaces e instala todos los paquetes (frontend, main) de una vez.

Stack: Electron 39, React 18, Vite 8, Tailwind v4, lucide-react, Mongoose 8, bcryptjs, Vitest.

## 2. Base de datos

MongoDB debe estar corriendo. `connection.js` conecta por defecto a la base `eduplatform`; no hace
falta `.env`, pero si lo creas puedes definir `MONGODB_URI`.

Sembrar la base (los seeds usan helpers de mongosh, por eso se cargan por stdin):

```bash
# Dataset de volumen: 100 cursos, 999 estudiantes, 99 profesores + 2 cuentas de testeo.
# Las lecciones traen contenido en Markdown, duración y calificación. Idempotente.
mongosh "mongodb://localhost:27017" < seeds/eduplatform.volume.seed.js
```

Alternativa mínima con inconsistencias intencionales del caso (datos huérfanos), para probar el
manejo null-safe:

```bash
mongosh "mongodb://localhost:27017" < seeds/eduplatform.seed.js
```

Credenciales de prueba (contraseña `edu12345`):

- Estudiante: `estudiante1@edu.cl` (o `alumno.test@edu.cl`)
- Docente (instructor): `instructor1@edu.cl` (o `profe.test@edu.cl`)

## 3. Correr

```bash
npm run dev      # Vite (:5173) + Electron coordinados
```

En desarrollo la app carga `localhost:5173`; en producción, el bundle publicado en GitHub Pages.

## Scripts útiles

```bash
npm run dev:frontend   # solo Vite
npm run build          # build de producción del frontend
npm run lint           # ESLint
npm run format         # Prettier
npm run test           # Vitest
npm run shot           # abre la app con Playwright y guarda capturas (verificación visual)
```

## Checklist

- [ ] Node 18+ y MongoDB corriendo en `localhost:27017`.
- [ ] `npm install` desde la raíz.
- [ ] Seed cargado en la base `eduplatform`.
- [ ] `npm run dev` abre la ventana y el login entra como estudiante (`estudiante1@edu.cl`) y como
      docente (`instructor1@edu.cl`), contraseña `edu12345`.
