# Estructura del Proyecto — EduPlataform

Referencia rápida de la arquitectura del monorepo (Electron + React + MongoDB).
La documentación general está en [README.md](../README.md).

---

## Árbol resumido

```
packages/frontend/src/
├── main.jsx                → importa ./styles/main.css (único compositor)
├── app.jsx                 → modo landing (sin auth) / modo autenticado
├── data/                   → fuente única de datos mock (DRY)
├── components/             → app autenticado (dark theme, prefijo .db-)
├── features/
│   ├── dashboard/          → vista principal autenticada
│   └── landing/            → landing pública (light theme, prefijo .lp-)
└── styles/
    ├── main.css            → compositor de toda la cascada CSS
    ├── index.css / auth.css / Dashboard.css / app.css
    └── landing/            → 8 módulos CSS (SRP)

packages/main/src/
├── index.js                → entrada Electron
├── preload.cjs             → contextBridge → window.api
├── db/connection.js        → connectDB / disconnectDB
├── db/models/User.js       → esquema Mongoose con bcryptjs
└── ipc/userHandlers.js     → handlers auth:* y user:*

packages/shared/src/
├── index.js
└── ipc/channels.js         → IPC_CHANNELS (constantes compartidas)
```

> Nota: el bridge debe llamarse `preload.cjs` (no `preload.js`). El paquete `main`
> es un ES Module (`"type": "module"`) y el preload usa `require()` de CommonJS,
> por lo que necesita extensión `.cjs`. `index.js` carga `preload.cjs` en
> `webPreferences.preload`.

---

## Workspaces

| Paquete | `name` | Rol |
|---|---|---|
| `packages/frontend` | `frontend` | UI React + Vite |
| `packages/main` | `main` | Proceso principal Electron (pseudo-backend IPC) |
| `packages/shared` | `@eduplatform/shared` | Constantes y código compartido |

---

## Decisiones de diseño clave

**CSS en dos paletas separadas:**
Los estilos del app autenticado usan variables `--color-*` (dark) y prefijo `.db-`.
Los estilos de la landing usan variables `--lp-*` (scoped en `.lp`) y prefijo `.lp-`.
Esto evita colisiones de cascada al cambiar entre modos.

**Datos en `src/data/`:**
`COURSES` y `STATS` se centralizaron en `data/courses.js` y `data/stats.js`.
Todos los componentes que necesitan estos datos importan desde ahí (DRY).

**`LoginRegister.jsx` con prop `onSuccess`:**
El componente acepta un callback `onSuccess(user)` que `app.jsx` usa para pasar del
modo landing al modo autenticado. Sin el prop, funciona de forma autónoma.
