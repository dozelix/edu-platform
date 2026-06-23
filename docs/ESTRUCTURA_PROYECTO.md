# Estructura del Proyecto — EduPlatform

Referencia rápida de la arquitectura. La documentación completa está en [README.md](../README.md#3-estructura-de-archivos).

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
├── db/models/User.js       → esquema Mongoose con bcrypt
└── ipc/userHandlers.js     → handlers auth:* y user:*

packages/shared/src/
└── ipc/channels.js         → IPC_CHANNELS (constantes compartidas)
```

---

## Decisiones de diseño clave

**CSS en dos paletas separadas:**
Los estilos del app autenticado usan variables `--color-*` (dark) y prefijo `.db-`. Los estilos de la landing usan variables `--lp-*` (scoped en `.lp`) y prefijo `.lp-`. Esto evita colisiones de cascada al cambiar entre modos.

**Datos en `src/data/`:**
`COURSES` y `STATS` se definían en múltiples archivos. Se centralizaron en `data/courses.js` y `data/stats.js`. Todos los componentes que necesitan estos datos importan desde ahí.

**`LoginRegister.jsx` con prop `onSuccess`:**
El componente acepta un callback `onSuccess(user)` que `app.jsx` usa para pasar del modo landing al modo autenticado. Sin el prop, funciona de forma autónoma.
