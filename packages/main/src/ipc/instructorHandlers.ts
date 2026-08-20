import { ipcMain } from 'electron'
import mongoose from 'mongoose'
import { getUsuario } from '../session.js'

ipcMain.handle('instructor:resumen', async () => {
  try {
    const usuario = getUsuario()
    if (!usuario) return { success: false, error: 'No hay sesión iniciada' }
    if (usuario.tipo !== 'instructor') {
      return { success: false, error: 'No autorizado' }
    }
    let uid
    try {
      uid = new mongoose.Types.ObjectId(usuario.id)
    } catch {
      return { success: false, error: 'usuarioId inválido' }
    }

    const db = mongoose.connection.db
    if (!db) {
      return { success: false, error: 'DB no conectada' }
    }
    const cursos = await db.collection('cursos').find({ instructor_id: uid }).toArray()
    const cursoIds = cursos.map((c) => c._id)
    const inscripciones = cursoIds.length
      ? await db.collection('inscripciones').find({ curso_id: { $in: cursoIds } }).toArray()
      : []

    const usuarioIds = Array.from(
      new Set(inscripciones.map((i: any) => i.usuario_id?.toString()).filter(Boolean))
    )
    const nombrePorId = new Map<string, string>()
    if (usuarioIds.length) {
      const ids = usuarioIds.map((s: any) => new mongoose.Types.ObjectId(s))
      const usuarios = await db
        .collection('usuarios')
        .find({ _id: { $in: ids } }, { projection: { nombre: 1 } })
        .toArray()
      for (const u of usuarios) {
        nombrePorId.set(u._id.toString(), u.nombre)
      }
    }

    const inscPorCurso = new Map<string, any[]>()
    for (const ins of inscripciones) {
      const k = (ins as any).curso_id?.toString()
      if (!k) continue
      if (!inscPorCurso.has(k)) inscPorCurso.set(k, [])
      inscPorCurso.get(k)!.push(ins)
    }

    const cursosData = cursos.map((c: any) => {
      const insc = inscPorCurso.get(c._id.toString()) || []
      const estudiantes = insc
        .map((i: any) => ({
          nombre: nombrePorId.get(i.usuario_id?.toString()) || 'Estudiante desconocido',
          progreso: typeof i.progreso === 'number' ? i.progreso : 0,
        }))
        .sort((a, b) => b.progreso - a.progreso)
      const progresoPromedio = estudiantes.length
        ? Math.round(estudiantes.reduce((a, e) => a + e.progreso, 0) / estudiantes.length)
        : 0
      return {
        id: c._id.toString(),
        nombre: c.nombre,
        calificacion: c.calificacion ?? null,
        estado: c.estado || null,
        nEstudiantes: estudiantes.length,
        progresoPromedio,
        estudiantes,
      }
    })

    const totalEstudiantes = new Set(
      inscripciones.map((i: any) => i.usuario_id?.toString()).filter(Boolean)
    ).size
    const conCalif = cursos.filter((c: any) => typeof c.calificacion === 'number')
    const calificacionPromedio = conCalif.length
      ? (conCalif.reduce((a, c: any) => a + c.calificacion, 0) / conCalif.length).toFixed(1)
      : null

    return {
      success: true,
      data: {
        cursos: cursosData,
        totales: {
          cursos: cursos.length,
          estudiantes: totalEstudiantes,
          calificacionPromedio,
        },
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
