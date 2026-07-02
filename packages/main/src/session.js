// Sesion del proceso main para esta app de escritorio de una sola ventana.
// Guarda quien inicio sesion para que los handlers privilegiados usen esta
// identidad y NO el usuarioId que envia el renderer (que podria venir manipulado
// por un renderer comprometido). Se fija en auth:login/register y se limpia en
// auth:logout. No es un modelo de tokens: para un unico usuario por ventana basta.
let usuarioActual = null

export function setUsuario(usuario) {
  usuarioActual = usuario
}

export function getUsuario() {
  return usuarioActual
}

export function getUsuarioId() {
  return usuarioActual ? usuarioActual.id : null
}

export function limpiarSesion() {
  usuarioActual = null
}
