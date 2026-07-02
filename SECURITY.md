# Security Policy — EduPlataform

**Estado**: Beta / En desarrollo. No usar en producción sin completar el checklist de abajo.

## Versiones soportadas

| Versión | Soporte activo |
|---|---|
| 1.0.x (actual) | Sí |
| < 1.0 | No |

---

## Configuración de seguridad de Electron

EduPlataform implementa las recomendaciones de seguridad de la guía oficial de Electron:

| Configuración | Valor | Propósito |
|---|---|---|
| `nodeIntegration` | `false` | El renderer no tiene acceso directo a Node.js |
| `contextIsolation` | `true` | El contexto del renderer está aislado del preload |
| `preload` | `preload.cjs` | Único puente de comunicación autorizado |

El preload expone únicamente `window.api.invoke`, y solo para una lista blanca de canales
conocidos, mediante `contextBridge.exposeInMainWorld`.

---

## Estado de endurecimiento

Resuelto:
- **Whitelist de canales IPC** en `packages/main/src/preload.cjs`: `window.api.invoke` solo acepta
  canales conocidos; cualquier otro se rechaza.
- **Content-Security-Policy** por sesión en `packages/main/src/index.js`: estricta en producción y
  relajada en desarrollo para el HMR de Vite; habilita solo los orígenes usados.
- **Fallo de BD no fatal**: `connectDB` ya no llama `process.exit(1)`; la ventana se abre y las
  vistas muestran el error en lugar de cerrar el proceso.
- **Identidad desde la sesión del proceso main** (`packages/main/src/session.js`): los handlers
  privilegiados derivan el usuario de la sesión fijada en `auth:login`/`auth:register`, no del id
  que envía el renderer. `instructor:resumen` además exige `tipo === 'instructor'`. Un renderer
  comprometido solo puede actuar como el usuario en sesión, no suplantar a otro.

Limitaciones conocidas (aceptables para esta entrega de escritorio local):
- La sesión vive en memoria del proceso main y es de una sola ventana; un despliegue
  multiusuario/multiventana o cliente-servidor requeriría tokens firmados por petición.
- Sin persistencia de sesión: al recargar el renderer hay que volver a iniciar sesión.

---

## Checklist de seguridad pre-producción

- [x] Whitelist de canales IPC en `preload.cjs`
- [x] CSP (Content Security Policy) por sesión en Electron
- [x] Sesión en el proceso main para no confiar en el id que envía el renderer (`session.js`);
  tokens firmados por petición quedan pendientes solo para un despliegue multiusuario/cliente-servidor
- [ ] Validar/sanitizar todo input en los handlers IPC (Main Process)
- [ ] Configurar autenticación de MongoDB con credenciales fuertes
- [ ] Deshabilitar dev tools en builds de producción: `webPreferences: { devTools: false }`
- [ ] Auditoría de código de seguridad

---

## Hashing de contraseñas

Se usa **bcryptjs** con salt rounds 10 (ver `packages/main/src/db/models/Usuario.js`).
El hash se aplica en un hook `pre('save')` del esquema; la verificación usa
`userSchema.methods.comparePassword`. Longitud mínima de contraseña: 6 caracteres
(validada en el modelo y en `auth:register`).

---

## Reporte de vulnerabilidades

1. **No abras un issue público** — los problemas de seguridad se comunican en privado.
2. Escribe al mantenedor principal: [@dozelix](https://github.com/dozelix) vía GitHub.
3. Incluye: descripción, pasos para reproducir, impacto estimado y, opcionalmente,
   sugerencia de corrección.

Recibirás confirmación en menos de 72 horas.

---

## Buenas prácticas para contribuidores

- Nunca guardes credenciales, tokens o URIs de base de datos en el código. Usa `.env.local`
  (ignorado por git).
- No deshabilites `contextIsolation` ni actives `nodeIntegration` bajo ninguna circunstancia.
- Los canales IPC nuevos deben añadirse a la whitelist de `packages/main/src/preload.cjs` y
  registrarse con su `ipcMain.handle` en `packages/main/src/ipc/`; documentarlos en este archivo.
- Toda validación de datos debe hacerse en el Main Process, nunca confiar solo en el renderer.
