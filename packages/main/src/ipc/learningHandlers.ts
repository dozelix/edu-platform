import { ipcMain } from 'electron'
import mongoose from 'mongoose'
import { getUsuarioId } from '../session.js'

ipcMain.handle('aprendizaje:listar', async () => {
  try {
    const usuarioId = getUsuarioId()
    if (!usuarioId) {
      return { success: false, error: 'No hay sesión iniciada' }
    }
    let uid
    try {
      uid = new mongoose.Types.ObjectId(usuarioId)
    } catch {
      return { success: false, error: 'usuarioId inválido' }
    }

    const db = mongoose.connection.db
    if (!db) {
      return { success: false, error: 'DB no conectada' }
    }
    const inscripciones = await db.collection('inscripciones').find({ usuario_id: uid }).toArray()

    const cursoIds = Array.from(new Set(inscripciones.map((i: any) => i.curso_id?.toString()).filter(Boolean)))
    const cursos = cursoIds.length
      ? await db
          .collection('cursos')
          .find({ _id: { $in: cursoIds.map((s: any) => new mongoose.Types.ObjectId(s)) } })
          .toArray()
      : []

    const instructorIds = Array.from(new Set(cursos.map((c: any) => c.instructor_id?.toString()).filter(Boolean)))
    const instructores = instructorIds.length
      ? await db
          .collection('usuarios')
          .find({ _id: { $in: instructorIds.map((s: any) => new mongoose.Types.ObjectId(s)) } }, { projection: { nombre: 1 } })
          .toArray()
      : []

    const lecciones = cursoIds.length
      ? await db
          .collection('lecciones')
          .find({ curso_id: { $in: cursoIds.map((s: any) => new mongoose.Types.ObjectId(s)) } })
          .toArray()
      : []

    const cursoPorId = new Map(cursos.map((c: any) => [c._id.toString(), c]))
    const instructorPorId = new Map(instructores.map((u: any) => [u._id.toString(), u.nombre]))

    const data = inscripciones.map((ins: any) => {
      const progreso = typeof ins.progreso === 'number' ? ins.progreso : 0
      const curso = cursoPorId.get(ins.curso_id?.toString())

      if (!curso) {
        return {
          inscripcionId: ins._id.toString(),
          cursoId: ins.curso_id ? ins.curso_id.toString() : null,
          curso: 'Curso no disponible',
          instructor: '—',
          progreso,
          ultimaLeccion: '—',
          continuarLeccionId: null,
          disponible: false,
        }
      }

      const lecsCurso = lecciones
        .filter((l: any) => l.curso_id?.toString() === curso._id.toString())
        .sort((a: any, b: any) => (a.numero || 0) - (b.numero || 0))

      const completadas = new Set((ins.lecciones_completadas || []).map((x: any) => x.toString()))
      const completadasEnOrden = lecsCurso.filter((l: any) => completadas.has(l._id.toString()))

      const pendiente = lecsCurso.find((l: any) => !completadas.has(l._id.toString()))
      const continuar = pendiente || lecsCurso[lecsCurso.length - 1] || null
      const ultima = completadasEnOrden[completadasEnOrden.length - 1] || null

      return {
        inscripcionId: ins._id.toString(),
        cursoId: curso._id.toString(),
        curso: curso.nombre,
        instructor: instructorPorId.get(curso.instructor_id?.toString()) || 'Instructor desconocido',
        progreso,
        ultimaLeccion: ultima ? (ultima as any).titulo : 'Sin empezar',
        continuarLeccionId: continuar ? (continuar as any)._id.toString() : null,
        disponible: true,
      }
    })

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('inscripcion:crear', async (_, { cursoId } = {}) => {
  try {
    const usuarioId = getUsuarioId()
    if (!usuarioId) {
      return { success: false, error: 'No hay sesión iniciada' }
    }
    if (!cursoId) {
      return { success: false, error: 'cursoId requerido' }
    }
    let uid, cid
    try {
      uid = new mongoose.Types.ObjectId(usuarioId)
      cid = new mongoose.Types.ObjectId(cursoId)
    } catch {
      return { success: false, error: 'Identificador inválido' }
    }

    const db = mongoose.connection.db
    if (!db) {
      return { success: false, error: 'DB no conectada' }
    }
    const curso = await db.collection('cursos').findOne({ _id: cid })
    if (!curso) {
      return { success: false, error: 'El curso no existe' }
    }

    const yaInscrito = await db.collection('inscripciones').findOne({ usuario_id: uid, curso_id: cid })
    if (yaInscrito) {
      return { success: false, error: 'Ya estás inscrito en este curso' }
    }

    const r = await db.collection('inscripciones').insertOne({
      usuario_id: uid,
      curso_id: cid,
      progreso: 0,
    })
    return { success: true, data: { id: r.insertedId.toString() } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
