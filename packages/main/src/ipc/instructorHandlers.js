import { ipcMain } from 'electron'
import mongoose from 'mongoose'

// ======================================================
// IPC Instructor Handlers (Caso 3 — visibilidad del instructor)
// El PDF pide que el instructor "vea quien esta aprendiendo": sus cursos con los
// estudiantes inscritos y su progreso. Scopeado por instructor_id: cada instructor
// solo ve SUS cursos y sus estudiantes. Null-safe ante nombres/datos faltantes.
// Canal: instructor:resumen
// ======================================================

ipcMain.handle('instructor:resumen', async (_, usuarioId) => {
  try {
    if (!usuarioId) return { success: false, error: 'usuarioId requerido' }
    let uid
    try {
      uid = new mongoose.Types.ObjectId(usuarioId)
    } catch {
      return { success: false, error: 'usuarioId inválido' }
    }

    const db = mongoose.connection.db
    const cursos = await db.collection('cursos').find({ instructor_id: uid }).toArray()
    const cursoIds = cursos.map((c) => c._id)
    const inscripciones = cursoIds.length
      ? await db.collection('inscripciones').find({ curso_id: { $in: cursoIds } }).toArray()
      : []
    const usuarios = await db.collection('usuarios').find().toArray()
    const nombrePorId = new Map(usuarios.map((u) => [u._id.toString(), u.nombre]))

    // Inscripciones agrupadas por curso para resolver estudiantes y progreso.
    const inscPorCurso = new Map()
    for (const ins of inscripciones) {
      const k = ins.curso_id?.toString()
      if (!k) continue
      if (!inscPorCurso.has(k)) inscPorCurso.set(k, [])
      inscPorCurso.get(k).push(ins)
    }

    const cursosData = cursos.map((c) => {
      const insc = inscPorCurso.get(c._id.toString()) || []
      const estudiantes = insc
        .map((i) => ({
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

    // Estudiantes unicos entre todos sus cursos (un alumno puede estar en varios).
    const totalEstudiantes = new Set(
      inscripciones.map((i) => i.usuario_id?.toString()).filter(Boolean)
    ).size
    const conCalif = cursos.filter((c) => typeof c.calificacion === 'number')
    const calificacionPromedio = conCalif.length
      ? (conCalif.reduce((a, c) => a + c.calificacion, 0) / conCalif.length).toFixed(1)
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
  } catch (error) {
    return { success: false, error: error.message }
  }
})
