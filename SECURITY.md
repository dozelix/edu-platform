# Security Policy — EduPlatform

## Versiones soportadas

| Versión | Soporte activo |
|---|---|
| 1.0.x (actual) | Sí |
| < 1.0 | No |

---

## Configuración de seguridad de Electron

EduPlatform implementa las recomendaciones de seguridad de la guía oficial de Electron:

| Configuración | Valor | Propósito |
|---|---|---|
| `nodeIntegration` | `false` | El renderer no tiene acceso directo a Node.js |
| `contextIsolation` | `true` | El contexto del renderer está aislado del preload |
| `preload` | `preload.cjs` | Único puente de comunicación autorizado |

El preload expone exclusivamente `window.api.invoke` y `window.api.on` mediante `contextBridge.exposeInMainWorld`.

---

## Problemas de seguridad conocidos

Los siguientes problemas fueron identificados en la revisión de QA y están pendientes de corrección. Se listan aquí para transparencia del equipo.

### CRÍTICO — Sin whitelist de canales IPC

**Archivo:** `packages/main/src/preload.cjs`

El método `window.api.invoke(channel, ...args)` acepta cualquier string como canal sin validación. En modo producción la app carga desde GitHub Pages; si esa URL fuera comprometida, un script malicioso podría invocar handlers IPC arbitrarios.

**Solución pendiente:**
```js
const ALLOWED = ['auth:login', 'auth:register', 'auth:logout',
                 'user:get-all', 'user:get-by-id', 'user:create',
                 'user:update', 'user:delete']

invoke: (channel, ...args) => {
  if (!ALLOWED.includes(channel)) throw new Error(`Canal no permitido: ${channel}`)
  return ipcRenderer.invoke(channel, ...args)
}
```

### ALTO — `user:get-all` devuelve hashes de contraseña

**Archivo:** `packages/main/src/ipc/userHandlers.js` línea 100

`User.find().lean()` no excluye el campo `password`. Aunque el hash no es texto plano, viola el principio de mínimo privilegio.

**Solución pendiente:** Cambiar a `User.find().select('-password').lean()`

### ALTO — `user:create` omite validaciones de autenticación

**Archivo:** `packages/main/src/ipc/userHandlers.js` línea 120

El handler `user:create` acepta `userData` sin validar email, longitud de contraseña ni rol. Permite crear usuarios `admin` sin pasar por el flujo de `auth:register`.

### MEDIO — Sin persistencia de sesión

La sesión activa vive únicamente en el estado React. Al cerrar y reabrir la app, el usuario debe autenticarse de nuevo. El canal `auth:get-current` está definido en `shared/src/ipc/channels.js` pero sin implementación en el backend.

### MEDIO — `connectDB` termina el proceso con `process.exit(1)`

Si MongoDB no está disponible, Electron cierra abruptamente sin mostrar mensaje al usuario.

---

## Reporte de vulnerabilidades

Si descubres una vulnerabilidad de seguridad en este proyecto:

1. **No abras un issue público** — los issues de seguridad deben comunicarse de forma privada.
2. Escribe directamente al mantenedor principal: [@dozelix](https://github.com/dozelix) vía GitHub.
3. Incluye en tu reporte:
   - Descripción del problema
   - Pasos para reproducirlo
   - Impacto estimado
   - Sugerencia de corrección (opcional)

Recibirás confirmación en menos de 72 horas. Una vez corregido el problema, se añadirá una mención en el changelog al contribuyente que lo reportó.

---

## Buenas prácticas para contribuidores

- Nunca guardes credenciales, tokens o URIs de base de datos en el código. Usa `.env.local` (ignorado por git).
- No deshabilites `contextIsolation` ni actives `nodeIntegration` bajo ninguna circunstancia.
- Los canales IPC nuevos deben añadirse a `packages/shared/src/ipc/channels.js` y documentarse en este archivo.
- Toda validación de datos debe hacerse en el Main Process (backend), nunca confiar solo en validación del renderer.
