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

Limitaciones conocidas (aceptables para esta entrega de escritorio local):
- Los handlers IPC confían en el id de usuario que envía el renderer (no hay sesión ni token). Por
  ejemplo, `instructor:resumen` no verifica que el llamante sea ese instructor. Un despliegue
  multiusuario requeriría un modelo de sesión.
- Sin persistencia de sesión: al recargar el renderer hay que volver a iniciar sesión.

---

## Checklist de seguridad pre-producción

- [x] Whitelist de canales IPC en `preload.cjs`
- [x] CSP (Content Security Policy) por sesión en Electron
- [ ] Modelo de sesión/token para no confiar en el id que envía el renderer
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
- Los canales IPC nuevos deben añadirse a `packages/shared/src/ipc/channels.js` y documentarse
  en este archivo.
- Toda validación de datos debe hacerse en el Main Process, nunca confiar solo en el renderer.
