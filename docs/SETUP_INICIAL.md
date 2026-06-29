# Setup Inicial del Proyecto — EduPlataform

## Pre-requisitos

* **Node.js** v18 o superior → [Descargar LTS](https://nodejs.org/)
* **MongoDB** local (mongod) o accesible por URI → [Instalar](https://www.mongodb.com/docs/manual/installation/)
* **Git** → [Descargar](https://git-scm.com/)
* **IDE**: VS Code recomendado.

```bash
node --version
npm --version
git --version
```

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/dozelix/EduPlataform.git
cd EduPlataform
```

---

## 2. Estructura de carpetas (monorepo)

> La estructura ya está creada. Verifica que existan:

```bash
ls -la packages/main/src/
ls -la packages/frontend/src/
ls -la packages/shared/src/
```

Detalle en [ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md).

---

## 3. Instalar dependencias

Desde la raíz (npm workspaces instala todos los paquetes de una vez):

```bash
npm install
```

El proyecto usa, entre otros: Electron 39, React 18, Vite 8, Mongoose 8, bcryptjs,
ESLint 10, Prettier 3, Vitest 4 (ver `package.json` raíz para versiones exactas).

---

## 4. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto (está ignorado por git):

```env
MONGODB_URI=mongodb://localhost:27017/eduplatform
NODE_ENV=development
```

> La conexión usa `process.env.MONGODB_URI`. Si la variable no existe, `connection.js`
> cae a un valor por defecto. Define siempre la URI con la base `eduplatform`.

---

## 5. Puntos de entrada (referencia)

### `packages/main/src/index.js`

Proceso principal de Electron. En desarrollo carga Vite (`localhost:5173`); en producción
carga el bundle publicado en GitHub Pages.

```javascript
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const url = isDev
    ? 'http://localhost:5173'
    : 'https://dozelix.github.io/EduPlataform/'

  mainWindow.loadURL(url)
}

app.on('ready', async () => {
  await connectDB()
  await import('./ipc/userHandlers.js') // registrar handlers antes de abrir la ventana
  createWindow()
})
```

### `packages/main/src/preload.cjs`

Puente seguro (Context Bridge). Debe tener extensión `.cjs` porque el paquete `main` es
ES Module y el preload usa `require()`.

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args))
})
```

### `packages/main/src/db/connection.js`

```javascript
import mongoose from 'mongoose'

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduplatform'
    await mongoose.connect(mongoUri)
    console.log('MongoDB conectado')
  } catch (error) {
    console.error('Error conectando a MongoDB:', error)
    process.exit(1)
  }
}
```

### `packages/main/src/db/models/User.js`

El esquema real incluye `password` (hasheado con bcryptjs) y `role`:

```javascript
import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

export const User = model('User', userSchema)
```

---

## 6. Iniciar el entorno de desarrollo

Desde la raíz del monorepo (`EduPlataform`):

```bash
# Frontend + Electron coordinados (Vite en :5173, luego abre la ventana de Electron)
npm run dev
```

Otros scripts útiles (ver `package.json` raíz):

```bash
npm run dev:frontend   # solo Vite
npm run lint           # ESLint
npm run format         # Prettier
npm run test           # Vitest
```

---

## Checklist de validación del setup

* [ ] Node.js v18+ y Git instalados.
* [ ] MongoDB corriendo localmente (o URI accesible).
* [ ] `npm install` ejecutado desde la raíz.
* [ ] `.env.local` con `MONGODB_URI` apuntando a la base `eduplatform`.
* [ ] El bridge está en `packages/main/src/preload.cjs` (extensión `.cjs`).
* [ ] `npm run dev` abre la ventana de Electron sin errores y conecta a la BD.
