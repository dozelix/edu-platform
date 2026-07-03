# Auditoría: 200 correcciones, bugs y mejoras

Este documento reúne 200 puntos de mejora detectados en el proyecto EduPlataform, incluyendo problemas técnicos, de seguridad, de accesibilidad, de rendimiento y de configuración.

## 1. Root / configuración / dependencias
1. `package.json` root: `build:main` es solo un `echo`, no compila ni valida el proceso main.
2. `package.json` root: el script `build` depende de `build:main` inútil.
3. `package.json` root: `electron` y `electron:dev` no empaquetan ni generan artefactos reales.
4. `package.json` root: `homepage` apunta a GH Pages aunque la app Electron en producción no debería depender de ello.
5. `package.json` root: no hay versión mínima de Node declarada ni `engine` compatible.
6. `package.json` root: `devDependencies` y `dependencies` mezclan toolchain de frontend y main sin claridad.
7. `package.json` root: falta `prepare`/`preinstall` para workspace y hooks de instalación consistentes.
8. `package.json` root: `npm run dev` no valida que Vite haya arrancado correctamente antes de abrir Electron.
9. `packages/main/package.json`: no hay script de prueba, lint ni validación del main.
10. `packages/frontend/package.json`: no hay script `lint` o `test` local.
11. `packages/frontend/package.json`: no define `browserslist` ni compatibilidad de targets.
12. `eslint.config.js`: usa `globals.browser` globalmente, lo que oculta errores en el proceso main.
13. `eslint.config.js`: no hay reglas de seguridad/coding standard mínimas para Electron.
14. `packages/frontend/vite.config.js`: `strictPort` es bueno, pero no se documenta qué hacer si el puerto está ocupado.
15. `packages/frontend/vite.config.js`: alias `@` se declara pero no se usa consistentemente.
16. `.gitignore`: puede no cubrir todos los directorios de build y caches de VS Code.
17. `.prettierrc` existe, pero no hay configuración de formateo en monorepo.
18. `README.md`: el documento principal no refleja todos los scripts y limitaciones actuales.
19. `docs/SETUP.md`: no describe la necesidad de `mongosh` y la seed de volumen en el entorno real.
20. `SECURITY.md`: menciona whitelist IPC, pero no detalla todas las rutas de riesgo encontradas.

## 2. Scripts / deployment / verificación
21. `scripts/shot-electron.cjs`: no hay comprobación de fallo si Playwright o Electron no arrancan.
22. `scripts/shot-electron.cjs`: el flujo de capturas no es robusto frente a errores de render.
23. `scripts/verify-backend.cjs`: verifica Mongo pero no valida la forma de los mensajes de error.
24. `scripts/verify-backend.cjs`: usa `process.env` sin fallback claro para DB.
25. `package-lock.json`: hay versiones de dependencias que no coinciden con el root y el workspace.
26. `package-lock.json`: puede incluir paquetes transitorios innecesarios no usados por el proyecto.
27. `npm run test` no está integrado con una suite de CI/documentación.
28. `npm run lint` no se ejecuta automáticamente en los scripts de precommit.
29. `npm run format` no incluye `README.md` ni `docs`.
30. `package.json` root: `deploy` usa GH Pages sin validar build local.

## 3. Electron main / DB / runtime
31. `packages/main/src/index.js`: en producción carga la URL remota de GitHub Pages en lugar de un build local.
32. `packages/main/src/index.js`: no usa `mainWindow.once('ready-to-show')` para mostrar la ventana.
33. `packages/main/src/index.js`: `process.stdout.on('error')` intercepta EPIPE, pero no hay registro de por qué ocurre.
34. `packages/main/src/index.js`: `process.stderr.on('error')` está vacío, ocultando posibles errores graves.
35. `packages/main/src/index.js`: `app.userAgentFallback` remueve `Electron`, lo que puede causar problemas con otras integraciones.
36. `packages/main/src/index.js`: CSP en dev permite `unsafe-inline` y `unsafe-eval` sin advertencia suficiente.
37. `packages/main/src/index.js`: CSP no cubre `frame-ancestors` ni protección contra clickjacking.
38. `packages/main/src/index.js`: CSP no actualiza cuando se agreguen nuevos orígenes de imagen o fuentes.
39. `packages/main/src/index.js`: si `connectDB()` falla, la app sigue abierta sin un mensaje claro de error.
40. `packages/main/src/index.js`: no hay manejo de reconexión a MongoDB si la conexión cae tras abrir.
41. `packages/main/src/db/connection.js`: `connectDB()` devuelve false pero no lanza error ni aborta startup.
42. `packages/main/src/db/connection.js`: no hay `mongoose.set('strictQuery')` ni opciones de conexión seguras.
43. `packages/main/src/db/connection.js`: no valida `MONGODB_URI` en un `.env` local o global.
44. `packages/main/src/db/connection.js`: usa `console.log`/`console.error` en vez de logger estructurado.
45. `packages/main/src/db/connection.js`: `disconnectDB()` no maneja que la conexión ya esté cerrada.
46. `packages/main/src/session.js`: la sesión se guarda en memoria y se pierde al recargar el renderer.
47. `packages/main/src/session.js`: no hay expiración ni verificación de tiempo de vida.
48. `packages/main/src/session.js`: no hay forma de invalidar sesión desde el backend aparte de `auth:logout`.
49. `packages/main/src/session.js`: no es seguro para múltiples ventanas; está diseñado solo para una.
50. `packages/main/src/session.js`: no hay auditoría de cambios de sesión ni logs de acceso.

## 4. Preload / seguridad / IPC
51. `packages/main/src/preload.cjs`: `invoke()` recibe argumentos sin validación de estructura.
52. `packages/main/src/preload.cjs`: whitelist de canales debe sincronizarse con los handlers reales.
53. `packages/main/src/preload.cjs`: no define API para eventos seguros, solo `invoke`.
54. `packages/main/src/preload.cjs`: si se agrega un canal, no hay aviso de mantener la whitelist.
55. `packages/main/src/preload.cjs`: no evita que el renderer importe `ipcRenderer` si el contexto se rompe.
56. `packages/main/src/preload.cjs`: no hay protección contra payloads excesivamente grandes.
57. `packages/main/src/preload.cjs`: `ipcRenderer.invoke` devuelve el error sin normalizar.
58. `SECURITY.md`: menciona `window.api.invoke` pero no cubre fallback a `window.api` undefined.
59. `packages/main/src/index.js`: `nodeIntegration: false` está bien, pero no se documenta en README.
60. `packages/main/src/index.js`: `contextIsolation: true` no protege contra malas prácticas en el preload.

## 5. IPC / auth / course / common handlers
61. `packages/main/src/ipc/authHandlers.js`: no hay rate limit de intentos de login.
62. `packages/main/src/ipc/authHandlers.js`: `auth:register` puede crear instructores sin control.
63. `packages/main/src/ipc/authHandlers.js`: regex de email muy simple.
64. `packages/main/src/ipc/authHandlers.js`: el error `error.message` puede filtrar detalles internos.
65. `packages/main/src/ipc/authHandlers.js`: no valida `tipo` de cuenta con un conjunto explícito.
66. `packages/main/src/ipc/authHandlers.js`: no hay sanitización de nombres más allá de trim.
67. `packages/main/src/ipc/authHandlers.js`: no hay validación de cantidad máxima de usuarios/registro.
68. `packages/main/src/ipc/authHandlers.js`: no usa `await` para `setUsuario` porque no es async.
69. `packages/main/src/ipc/authHandlers.js`: `auth:logout` siempre devuelve success aunque la sesión ya estuviera null.
70. `packages/main/src/ipc/courseHandlers.js`: carga todos los cursos y todos los instructores sin paginar.
71. `packages/main/src/ipc/courseHandlers.js`: no proyecta campos, leyendo más datos de los necesarios.
72. `packages/main/src/ipc/courseHandlers.js`: no hay caché para `curso:listar`.
73. `packages/main/src/ipc/courseHandlers.js`: `usuarioId` inválido se ignora sin coherencia.
74. `packages/main/src/ipc/courseHandlers.js`: no hay verificación de que el usuario inscrito sea estudiante.
75. `packages/main/src/ipc/courseHandlers.js`: `calificacion` null-safe, pero no aplica valor por defecto cuando falta.
76. `packages/main/src/ipc/courseHandlers.js`: no valida la presencia de `c.nombre` ni `c.instructor_id`.
77. `packages/main/src/ipc/courseHandlers.js`: si `cursos` está vacío, no hay mensaje específico.
78. `packages/main/src/ipc/learningHandlers.js`: descarga todas las colecciones `cursos`, `instructores` y `lecciones`.
79. `packages/main/src/ipc/learningHandlers.js`: hace múltiples transformaciones en memoria en vez de agregación Mongo.
80. `packages/main/src/ipc/learningHandlers.js`: no limita el tamaño de la respuesta.
81. `packages/main/src/ipc/learningHandlers.js`: no valida existencia de `usuarioId` antes de buscar inscripciones.
82. `packages/main/src/ipc/learningHandlers.js`: `curso.id` no se convierte seguro si `curso_id` está mal formado.
83. `packages/main/src/ipc/learningHandlers.js`: `instructorPorId` puede devolver `undefined` si faltan datos.
84. `packages/main/src/ipc/learningHandlers.js`: no hay validación de progreso mayor a 100 o menor a 0.
85. `packages/main/src/ipc/learningHandlers.js`: `continuarLeccionId` puede devolver `null` para cursos válidos sin lecciones.
86. `packages/main/src/ipc/learningHandlers.js`: no hay un caso explícito para cursos huerfanos con inscripciones.
87. `packages/main/src/ipc/learningHandlers.js`: no informa si el usuario está inscrito en un curso inexistente como riesgo de datos.
88. `packages/main/src/ipc/learningHandlers.js`: no protege contra inyecciones de `ObjectId` malformados.
89. `packages/main/src/ipc/learningHandlers.js`: devuelve objetos con claves inconsistentes (`curso` vs `cursoId`).
90. `packages/main/src/ipc/learningHandlers.js`: no emplea índices ni queries optimizados para `inscripciones`.

## 6. IPC / lesson / comments / instructor handlers
91. `packages/main/src/ipc/lessonHandlers.js`: `leccion:obtener` permite leer cualquier lección aun no inscrito.
92. `packages/main/src/ipc/lessonHandlers.js`: no valida permiso de acceso al curso del usuario.
93. `packages/main/src/ipc/lessonHandlers.js`: `cursoNombre` usa fallback de texto no configurable.
94. `packages/main/src/ipc/lessonHandlers.js`: `siguienteId` se calcula sin verificar orden correcto si faltan `numero`.
95. `packages/main/src/ipc/lessonHandlers.js`: `leccion:completar` hace doble `updateOne` en la misma inscripción.
96. `packages/main/src/ipc/lessonHandlers.js`: no comprueba que el curso de la lección exista antes de marcar completada.
97. `packages/main/src/ipc/lessonHandlers.js`: `comentario:listar` lee todos los usuarios para resolver nombres.
98. `packages/main/src/ipc/lessonHandlers.js`: ordena comentarios por `_id` en vez de `fecha`.
99. `packages/main/src/ipc/lessonHandlers.js`: `comentario:crear` no valida la longitud máxima del texto.
100. `packages/main/src/ipc/lessonHandlers.js`: no verifica si el usuario está inscrito en la lección antes de comentar.
101. `packages/main/src/ipc/lessonHandlers.js`: no filtra caracteres peligrosos en el comentario.
102. `packages/main/src/ipc/instructorHandlers.js`: lee todos los usuarios del sistema para resolver nombres.
103. `packages/main/src/ipc/instructorHandlers.js`: `calificacionPromedio` se convierte a string con `toFixed` en lugar de número.
104. `packages/main/src/ipc/instructorHandlers.js`: no gestiona cursos sin `estado` con un valor por defecto claro.
105. `packages/main/src/ipc/instructorHandlers.js`: no hay verificación de sesión de instructor antes de seguir.
106. `packages/main/src/ipc/instructorHandlers.js`: no hay paginación en estudiantes inscritos.
107. `packages/main/src/ipc/instructorHandlers.js`: no protege contra `cursoIds` vacíos en la consulta `$in`.
108. `packages/main/src/ipc/instructorHandlers.js`: calcula `progresoPromedio` en cursos sin estudiantes como 0, en lugar de `null`.
109. `packages/main/src/ipc/instructorHandlers.js`: no filtra estudiantes duplicados por nombre en diferentes cursos.
110. `packages/main/src/ipc/instructorHandlers.js`: no muestra si el instructor no tiene cursos.

## 7. Frontend shell / app / navegación / estado
111. `packages/frontend/src/app.jsx`: la app no restaura la sesión al recargar.
112. `packages/frontend/src/app.jsx`: `currentUser` solo vive en App, no en un contexto reusable.
113. `packages/frontend/src/app.jsx`: `sidebarOpen` no tiene estado de foco accesible.
114. `packages/frontend/src/app.jsx`: `requireLogin` puede dejar curso pendiente si el usuario cancela.
115. `packages/frontend/src/app.jsx`: `enrollCourse()` atrapa errores sin informar al usuario.
116. `packages/frontend/src/app.jsx`: no hay feedback al usuario al cerrar sesión si el logout falla.
117. `packages/frontend/src/app.jsx`: `handleLogout` limpia `activeLeccionId` pero no puede reprocesar el historial.
118. `packages/frontend/src/app.jsx`: `handleNav` no valida `activeNav` ni ofrece 404 / fallback.
119. `packages/frontend/src/app.jsx`: la navegación `lesson` puede mostrar lección sin `leccionId`.
120. `packages/frontend/src/app.jsx`: no hay rutas basadas en URL ni bookmarking.
121. `packages/frontend/src/app.jsx`: `dbStatus` se consulta una sola vez, no en intervalos.
122. `packages/frontend/src/app.jsx`: las vistas privadas no bloquean la carga inicial del contenido.
123. `packages/frontend/src/app.jsx`: `appUser.initials` no normaliza acentos ni nombres cortos.
124. `packages/frontend/src/app.jsx`: no hay modo offline o error de fallback si `window.api` no existe.
125. `packages/frontend/src/app.jsx`: `useEffect` para `db:estado` no limpia la variable `activo` con seguridad.
126. `packages/frontend/src/app.jsx`: `Sidebar` y `Topbar` usan props de estado sin memoizar.
127. `packages/frontend/src/app.jsx`: el layout no adapta el contenido cuando `activeNav` cambia en pantallas pequeñas.
128. `packages/frontend/src/app.jsx`: `InstructorDashboard` aparece sin chequear `tipo` adicionalmente.
129. `packages/frontend/src/app.jsx`: el botón de login no indica si la acción abre modal o página.
130. `packages/frontend/src/app.jsx`: no hay `aria-live` para cambios de contenido después de login.

## 8. UI shell / accesibilidad / componentes
131. `packages/frontend/src/components/Sidebar.jsx`: falta `aria-expanded` en menú móvil.
132. `packages/frontend/src/components/Sidebar.jsx`: no hay focus trap en el sidebar cuando se abre.
133. `packages/frontend/src/components/Sidebar.jsx`: el overlay no tiene `role="presentation"` ni `tabIndex`.
134. `packages/frontend/src/components/Sidebar.jsx`: modo oscuro no está documentado ni accesible.
135. `packages/frontend/src/components/Sidebar.jsx`: el texto `DB: ERROR` no explica la causa.
136. `packages/frontend/src/components/Topbar.jsx`: contenido del saludo no es visible para lectores de pantalla en estado anclado.
137. `packages/frontend/src/components/Topbar.jsx`: el botón de login no usa `type="button"` por defecto.
138. `packages/frontend/src/components/Topbar.jsx`: calculo de saludo depende de `new Date()` en cada render.
139. `packages/frontend/src/components/icons/Icons.jsx`: los SVG no usan `aria-hidden="true"` en todos los casos.
140. `packages/frontend/src/components/icons/Icons.jsx`: algunos iconos usan `strokeWidth="2"` pero no `stroke-linecap`/`stroke-linejoin` consistentes.
141. `packages/frontend/src/components/Sidebar.jsx`: el botón cerrar menú es demasiado pequeño en móvil.
142. `packages/frontend/src/components/Topbar.jsx`: no hay alternativa de texto para el avatar.
143. `packages/frontend/src/components/Sidebar.jsx`: no hay separación clara entre navegación y estado en el DOM.
144. `packages/frontend/src/components/Topbar.jsx`: el elemento `user.name` puede causar overflow si es muy largo.
145. `packages/frontend/src/components/Sidebar.jsx`: el menú no invalida el `activeNav` cuando la sesión cambia.
146. `packages/frontend/src/components/Sidebar.jsx`: no hay estilos o advertencias para `dbStatus` desconocido.
147. `packages/frontend/src/components/Sidebar.jsx`: la marca `EduPlatform` no usa un `h1` o estructura semántica.
148. `packages/frontend/src/components/Icons.jsx`: los SVG se importan correctamente, pero el icono de `graduation-cap` no es consistente con Lucide.
149. `packages/frontend/src/components/Sidebar.jsx`: no hay fallback si los iconos SVG fallan.
150. `packages/frontend/src/components/Topbar.jsx`: falta `aria-label` claro para el botón de abrir menú.

## 9. Auth / login / register UI
151. `packages/frontend/src/components/LoginRegister.jsx`: usa `setTimeout` para llamar `onSuccess`, creando retraso innecesario.
152. `packages/frontend/src/components/LoginRegister.jsx`: el registro no hace auto-login tras crear cuenta.
153. `packages/frontend/src/components/LoginRegister.jsx`: no hay validación cliente para email o password.
154. `packages/frontend/src/components/LoginRegister.jsx`: no hay mensajes de error/éxito accesibles con `aria-live`.
155. `packages/frontend/src/components/LoginRegister.jsx`: no hay `role="dialog"` ni `aria-modal` cuando actúa como overlay.
156. `packages/frontend/src/components/LoginRegister.jsx`: no hay foco inicial en el primer campo del formulario.
157. `packages/frontend/src/components/LoginRegister.jsx`: no hay trap de tabulación en el modal de login.
158. `packages/frontend/src/components/LoginRegister.jsx`: `currentUser` local es redundante con `onSuccess`.
159. `packages/frontend/src/components/LoginRegister.jsx`: los botones no deshabilitan mientras carga.
160. `packages/frontend/src/components/LoginRegister.jsx`: `success` se limpia con timeout sin cancelar en desmontaje.
161. `packages/frontend/src/components/LoginRegister.jsx`: `switchMode` no limpia los campos del formulario opuesto.
162. `packages/frontend/src/components/LoginRegister.jsx`: no hay explicación de los roles de cuenta instructor/estudiante.
163. `packages/frontend/src/components/LoginRegister.jsx`: el formulario no previene envío accidental con Enter cuando está deshabilitado.
164. `packages/frontend/src/components/LoginRegister.jsx`: `placeholder` se usa en lugar de labels complementarios.
165. `packages/frontend/src/components/LoginRegister.jsx`: no hay control de criterios de contraseña más allá de longitud mínima.
166. `packages/frontend/src/components/LoginRegister.jsx`: no hay mensaje de error si `window.api` no está disponible.
167. `packages/frontend/src/components/LoginRegister.jsx`: no hay handling de estados de red lenta.
168. `packages/frontend/src/components/LoginRegister.jsx`: `regTipo` puede ser cambiado a instructor sin validación adicional.
169. `packages/frontend/src/components/LoginRegister.jsx`: no hay información sobre política de privacidad o condiciones.
170. `packages/frontend/src/components/LoginRegister.jsx`: los campos de contraseña no usan `autocomplete="new-password"` en registro.

## 10. Catálogo / curso / conversor / filtros
171. `packages/frontend/src/features/courses/Catalog.jsx`: usa `<search>` HTML inválido.
172. `packages/frontend/src/features/courses/Catalog.jsx`: no hay debouncing en la búsqueda.
173. `packages/frontend/src/features/courses/Catalog.jsx`: la lista de instructores no se ordena alfabéticamente.
174. `packages/frontend/src/features/courses/Catalog.jsx`: la API de tasas se consume sin `catch` robusto y sin mensaje visible.
175. `packages/frontend/src/features/courses/Catalog.jsx`: no hay indicador de carga para la conversión de divisas.
176. `packages/frontend/src/features/courses/Catalog.jsx`: `formatearPrecio` puede devolver `NaN` si la tasa es 0 o inválida.
177. `packages/frontend/src/features/courses/Catalog.jsx`: `c.calificacion.toFixed(1)` falla si calificación no es número.
178. `packages/frontend/src/features/courses/Catalog.jsx`: `portadaDeCurso` puede devolver `'?` como iniciales en nombres cortos.
179. `packages/frontend/src/features/courses/Catalog.jsx`: no hay mensaje específico para resultados filtrados vacíos.
180. `packages/frontend/src/features/courses/Catalog.jsx`: `onError` de imagen manipula DOM directamente en vez de usar React.
181. `packages/frontend/src/features/courses/Catalog.jsx`: `inscribir()` recarga todo el catálogo tras cada inscripción.
182. `packages/frontend/src/features/courses/Catalog.jsx`: relación usuario-curso no se refresca de forma óptima.
183. `packages/frontend/src/features/courses/Catalog.jsx`: el botón inscribirse no usa `aria-busy`.
184. `packages/frontend/src/features/courses/Catalog.jsx`: no hay validación de `cursoId` antes de llamar `inscripcion:crear`.
185. `packages/frontend/src/features/courses/Catalog.jsx`: no hay advertencia si la conversión de moneda no está disponible.
186. `packages/frontend/src/features/courses/Catalog.jsx`: `estado === 'error'` muestra `error` plano sin localización.
187. `packages/frontend/src/features/courses/Catalog.jsx`: no hay soporte para filtros de nivel o precio.
188. `packages/frontend/src/features/courses/Catalog.jsx`: la búsqueda no ignora tildes ni mayúsculas con reglas de idioma.
189. `packages/frontend/src/features/courses/Catalog.jsx`: las tarjetas no tienen `aria-label` o descripción para lectores.
190. `packages/frontend/src/features/courses/Catalog.jsx`: el fallback `img` de portada no muestra un icono accesible.

## 11. Mi Aprendizaje / lección / comentarios / Markdown
191. `packages/frontend/src/features/learning/MyLearning.jsx`: no hay foco inicial en la vista tras navegación.
192. `packages/frontend/src/features/learning/MyLearning.jsx`: no hay `aria-live` para el estado de carga.
193. `packages/frontend/src/features/learning/MyLearning.jsx`: tabla no tiene `summary` ni mejores etiquetas semánticas.
194. `packages/frontend/src/features/learning/MyLearning.jsx`: el botón continuar no indica si el curso está no disponible.
195. `packages/frontend/src/features/learning/MyLearning.jsx`: el avatar de iniciales no valida nombres vacíos.
196. `packages/frontend/src/features/learning/MyLearning.jsx`: el cálculo de cursos completados ignora si `progreso` es inválido.
197. `packages/frontend/src/features/lesson/Lesson.jsx`: `urlEmbed()` no soporta URL tipo `watch?v=` ni `youtu.be`.
198. `packages/frontend/src/features/lesson/Lesson.jsx`: no hay manejo de IFrame fallido si YouTube bloquea el origen.
199. `packages/frontend/src/features/lesson/Lesson.jsx`: `comentario:crear` no deshabilita el botón de enviar si el texto está vacío.
200. `packages/frontend/src/features/lesson/Markdown.jsx`: la función Markdown admite algunos formatos pero no cubre seguridad completa de HTML.

---

Este documento puede usarse como referencia de auditoría y como checklist para prioridades posteriores.