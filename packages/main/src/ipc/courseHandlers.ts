import { ipcMain } from 'electron'
import mongoose from 'mongoose'
import { getUsuarioId } from '../session.js'

ipcMain.handle('curso:listar', async () => {
  try {
    const db = mongoose.connection.db
    if (!db) {
      return { success: false, error: 'DB no conectada' }
    }
    const cursos = await db.collection('cursos').find().toArray()
    const instructores = await db.collection('usuarios').find({ tipo: 'instructor' }).toArray()

    const nombrePorId = new Map(instructores.map((u) => [u._id.toString(), u.nombre]))

    const usuarioId = getUsuarioId()
    let inscritos = new Set<string>()
    if (usuarioId) {
      try {
        const uid = new mongoose.Types.ObjectId(usuarioId)
        const ins = await db.collection('inscripciones').find({ usuario_id: uid }).toArray()
        inscritos = new Set(ins.map((i: any) => i.curso_id?.toString()))
      } catch {
        // usuarioId inválido
      }
    }

    const data = cursos.map((c: any) => ({
      id: c._id.toString(),
      nombre: c.nombre,
      precio: typeof c.precio === 'number' ? c.precio : null,
      instructor: nombrePorId.get(c.instructor_id?.toString()) || 'Instructor desconocido',
      calificacion: c.calificacion ?? null,
      inscrito: inscritos.has(c._id.toString()),
    }))

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
