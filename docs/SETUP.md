
# Setup — EduPlatform

```markdown
## Requisitos

- Node.js v18 o superior
- MongoDB corriendo en `localhost:27017` (o accesible por `MONGODB_URI`)
- Git

## 1. Clonar e instalar

```bash
git clone [https://github.com/dozelix/edu-platform.git](https://github.com/dozelix/edu-platform.git)
cd EduPlataform
npm install

```

`npm install` usa workspaces e instala todos los paquetes (frontend, main) de una vez.

Stack: Electron 39, React 18, Vite 8, Tailwind v4, lucide-react, Mongoose 8, bcryptjs, Vitest.

## 2. Base de datos

MongoDB debe estar corriendo. Toda la configuración de entorno de la aplicación se gestiona a través del archivo `.env`. Antes de continuar, asegúrate de haber copiado el archivo de ejemplo y configurado tus variables locales:

cp .env.example .env

### Sembrado de Datos (Seeds)

Por motivos de seguridad, los scripts requieren que inyectes el hash de la contraseña por entorno. Copia el contenido de `.env.example` a tu propio archivo `.env` o pásalo directamente por la terminal:

```bash
# Definir el hash de desarrollo de forma temporal en tu terminal (Ej: edu12345)
export SEED_PASSWORD_HASH='$2a$10$u5bCbkxGWzJlxymEoyt7BeX/TDTQON7pcQkK7.a52hJ58N/y8cmo6'

# Dataset de volumen (Recomendado): 100 cursos, 999 estudiantes, 99 profesores + 2 cuentas de testeo.
# Las lecciones traen contenido en Markdown, duración y calificación. Idempotente.
mongosh "mongodb://localhost:27017" < seeds/eduplatform.volume.seed.js

```

> 💡 **Nota histórica:** El script de inicialización mínima alternativo (`seeds/eduplatform.seed.js`) ha sido unificado dentro de la carga del volumen estructurado de la plataforma para mantener la integridad referencial del entorno de pruebas.

Credenciales de prueba (contraseña `edu12345`) — las dos cuentas de testeo del seed de volumen:

* Estudiante: `alumno.test@edu.cl`
* Docente (instructor): `profe.test@edu.cl`

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

``` text

## Checklist

* [ ] Node 18+ y MongoDB corriendo en `localhost:27017`.
* [ ] `npm install` desde la raíz.
* [ ] Seed de volumen cargado en la base `eduplatform` proveyendo la variable `SEED_PASSWORD_HASH`.
* [ ] `npm run dev` abre la ventana y el login entra como estudiante (`alumno.test@edu.cl`) y como
docente (`profe.test@edu.cl`), contraseña `edu12345`.

```
