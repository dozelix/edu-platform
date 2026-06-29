export const IPC_CHANNELS = {
  // Auth channels
  AUTH_REGISTER: 'auth:register',
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_GET_CURRENT: 'auth:get-current',

  // User channels
  USER_GET_ALL: 'user:get-all',
  USER_GET_BY_ID: 'user:get-by-id',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Curso channels
  CURSO_LISTAR: 'curso:listar',

  // Aprendizaje channels
  APRENDIZAJE_LISTAR: 'aprendizaje:listar',
  INSCRIPCION_CREAR: 'inscripcion:crear',

  // Lección channels
  LECCION_OBTENER: 'leccion:obtener',
  LECCION_COMPLETAR: 'leccion:completar',
  COMENTARIO_LISTAR: 'comentario:listar',
  COMENTARIO_CREAR: 'comentario:crear',

  // DB status
  DB_STATUS: 'db:status',
}
