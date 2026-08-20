# Setup — EduPlatform

## Requisitos

- Node.js 18 o superior con **pnpm** (activado vía Corepack).
- MongoDB 7.x o compatible, accesible en `localhost:27017` o a través de `MONGODB_URI`.
- Git.
- Docker opcional para levantar MongoDB de forma local.

## 1. Clonar e instalar dependencias con pnpm

```bash
git clone https://github.com/dozelix/edu-platform.git
cd edu-platform
corepack enable
pnpm install
```

El comando instala los workspaces definidos en `pnpm-workspace.yaml`, configurando tanto el frontend como el proceso principal de Electron con TypeScript.

## 2. Configurar variables de entorno

El proceso principal espera un archivo `.env.local` en la raíz del proyecto. Puedes partir desde el ejemplo incluido:

```bash
cp .env.example .env.local
```

Variables relevantes:

- `MONGODB_URI`: URI de conexión a MongoDB.
- `SEED_PASSWORD_HASH`: hash bcrypt usado por el seed para crear usuarios de prueba.
- `NODE_ENV`: `development` para ejecutar la app localmente.
- `VITE_EXCHANGE_RATE_API_URL`: endpoint usado para convertir monedas.

## 3. Levantar MongoDB

### Opción A: MongoDB local
```bash
mongod
```

### Opción B: Docker
```bash
docker compose -f docker/docker-compose.yml up -d
```

## 4. Sembrar datos de prueba

```bash
export SEED_PASSWORD_HASH='$2a$10$u5bCbkxGWzJlxymEoyt7BeX/TDTQON7pcQkK7.a52hJ58N/y8cmo6'
mongosh "mongodb://localhost:27017/eduplatform" < seeds/eduplatform.volume.seed.js
```

O con Docker:
```bash
pnpm seed:docker
```

## 5. Ejecutar la aplicación

Desarrollo completo (TypeScript + Vite + Electron):
```bash
pnpm dev
```

Solo frontend (Vite):
```bash
pnpm dev:frontend
```

## 6. Credenciales de prueba

- Estudiante: `alumno.test@edu.cl`
- Instructor: `profe.test@edu.cl`
- Contraseña para ambas: `edu12345`

## 7. Scripts útiles

```bash
pnpm build          # Build de producción (backend + frontend)
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm test           # Vitest
```
