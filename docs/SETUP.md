
# Setup — EduPlatform

## Requisitos

- Node.js 18 o superior con npm.
- MongoDB 7.x o compatible, accesible en `localhost:27017` o a través de `MONGODB_URI`.
- Git.
- Docker opcional para levantar MongoDB de forma local.

## 1. Clonar e instalar dependencias

```bash
git clone https://github.com/dozelix/edu-platform.git
cd edu-platform
npm install
```

El comando instala los workspaces definidos en [package.json](../package.json), es decir, el frontend y el proceso principal de Electron.

## 2. Configurar variables de entorno

El proceso principal espera un archivo `.env.local` en la raíz del proyecto. Puedes partir desde el ejemplo incluido:

```bash
cp .env.example .env.local
```

Variables relevantes:

- `MONGODB_URI`: URI de conexión a MongoDB. El valor por defecto del ejemplo apunta a `mongodb://localhost:27017`.
- `SEED_PASSWORD_HASH`: hash bcrypt usado por el seed para crear usuarios de prueba.
- `NODE_ENV`: deja `development` para ejecutar la app localmente.
- `VITE_EXCHANGE_RATE_API_URL`: endpoint usado por la UI para convertir monedas.

## 3. Levantar MongoDB

### Opción A: MongoDB local

Si ya tienes MongoDB instalado, asegúrate de que esté corriendo y de que la base `eduplatform` sea accesible.

```bash
mongod
```

### Opción B: Docker

El repositorio incluye un compose listo para levantar MongoDB en local:

```bash
docker compose -f docker/docker-compose.yml up -d
```

Para detenerlo:

```bash
docker compose -f docker/docker-compose.yml down
```

## 4. Sembrar datos de prueba

El seed de volumen crea usuarios, cursos, lecciones, inscripciones y comentarios. El script requiere la variable `SEED_PASSWORD_HASH` para generar las contraseñas de prueba con el mismo formato que la app usa en producción.

### Opción local

```bash
export SEED_PASSWORD_HASH='$2a$10$u5bCbkxGWzJlxymEoyt7BeX/TDTQON7pcQkK7.a52hJ58N/y8cmo6'
mongosh "mongodb://localhost:27017/eduplatform" < seeds/eduplatform.volume.seed.js
```

### Opción Docker

```bash
npm run seed:docker
```

## 5. Ejecutar la aplicación

Desarrollo completo (Vite + Electron):

```bash
npm run dev
```

Solo frontend (Vite):

```bash
npm run dev:frontend
```

## 6. Credenciales de prueba

Tras cargar el seed, puedes entrar con las cuentas de ejemplo:

- Estudiante: `alumno.test@edu.cl`
- Instructor: `profe.test@edu.cl`
- Contraseña para ambas: `edu12345`

## 7. Scripts útiles

```bash
npm run build          # build del frontend
npm run lint           # eslint
npm run format         # prettier
npm run test           # vitest
npm run shot           # captura visual con Playwright
```

## 8. Verificación rápida

- [ ] Node 18+ y npm instalados.
- [ ] MongoDB reachable en `localhost:27017` o `MONGODB_URI` configurado.
- [ ] Archivo `.env.local` creado a partir de `.env.example`.
- [ ] Seed cargado en la base `eduplatform`.
- [ ] `npm run dev` inicia la app y permite entrar con las credenciales de prueba.

