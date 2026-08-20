let usuarioActual: any = null

export function setUsuario(usuario: any) {
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
