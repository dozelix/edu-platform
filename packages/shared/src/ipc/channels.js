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

  // DB status
  DB_STATUS: 'db:status',
}
