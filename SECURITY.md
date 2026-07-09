# Security Policy — EduPlatform

Estado: beta / escritorio local. No usar en producción sin completar el checklist de abajo.

## 1. Configuración de seguridad actual

La aplicación sigue las recomendaciones básicas de seguridad para Electron:

| Configuración | Valor | Propósito |
| --- | --- | --- |
| `nodeIntegration` | `false` | El renderer no tiene acceso directo a Node.js. |
| `contextIsolation` | `true` | El contexto del renderer queda aislado del preload. |
| `preload` | `preload.cjs` | Único puente de comunicación autorizado. |

El preload expone únicamente `window.api.invoke` y solo para una whitelist de canales conocidos. Cualquier canal no listado se rechaza con un error.

## 2. Estado de endurecimiento

### Implementado

- Whitelist de canales IPC en [packages/main/src/preload.cjs](packages/main/src/preload.cjs).
- CSP por sesión aplicada desde [packages/main/src/index.js](packages/main/src/index.js).
- Identidad del usuario derivada de la sesión del proceso main, no del renderer, en [packages/main/src/session.js](packages/main/src/session.js).
- Hashing de contraseñas con `bcryptjs` y validación mínima de longitud en [packages/main/src/db/models/Usuario.js](packages/main/src/db/models/Usuario.js).
- Normalización de email y contraseña en los handlers de login/registro para reducir errores de entrada y mejorar consistencia.

### Limitaciones actuales

- La sesión vive en memoria del proceso main y está pensada para una sola ventana; no hay tokens firmados ni persistencia de sesión.
- El arranque actual aborta si MongoDB no está disponible al iniciar la app. Esto es un punto de mejora para un modo degradado más robusto.
- La validación de payloads se realiza mayormente en los handlers IPC, pero no existe una capa central de sanitización ni un esquema formal para todos los mensajes entrantes.
- En desarrollo se habilitan DevTools; en producción no se abren automáticamente, pero la configuración de empaquetado debe revisarse antes de lanzar una build final.

## 3. Hashing de contraseñas

Las contraseñas se almacenan con `bcryptjs` usando 10 rondas de salt. La verificación ocurre en el método `comparePassword` del modelo y la longitud mínima se valida tanto en el modelo como en el flujo de registro.

## 4. Checklist de seguridad pre-producción

- [x] Whitelist de canales IPC.
- [x] CSP por sesión en Electron.
- [x] Sesión en el proceso main para evitar suplantación de identidad.
- [ ] Reforzar validación de todos los payloads IPC y errores de entrada.
- [ ] Usar credenciales fuertes para MongoDB en entornos no locales.
- [ ] Revisar y documentar el empaquetado final para deshabilitar DevTools en builds de producción si fuera necesario.
- [ ] Ejecutar auditoría de dependencias y revisar alertas de seguridad.

## 5. Reporte de vulnerabilidades

1. No abras un issue público para problemas de seguridad.
2. Contacta al mantenedor principal por GitHub en [@dozelix](https://github.com/dozelix).
3. Incluye descripción, pasos de reproducción, impacto estimado y, si aplica, una sugerencia de corrección.

## 6. Buenas prácticas para contribuidores

- Nunca guardar secretos ni URIs de bases de datos en el código fuente; usar `.env.local` y mantenerlo fuera de Git.
- No desactivar `contextIsolation` ni activar `nodeIntegration`.
- Cualquier canal IPC nuevo debe añadirse a la whitelist del preload y registrarse con su `ipcMain.handle` en el proceso main.
- La validación y normalización de datos debe hacerse en el proceso main, nunca confiar solamente en el renderer.
