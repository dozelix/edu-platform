import { ipcMain } from 'electron'
import mongoose from 'mongoose'
import { getUsuarioId } from '../session.js'

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id)
}

ipcMain.handle('leccion:obtener', async (_, { leccionId } = {}) => {
  try {
    if (!leccionId) return { success: false, error: 'leccionId requerido' }
    const usuarioId = getUsuarioId()
    let lid
    try {
      lid = toObjectId(leccionId)
    } catch {
      return { success: false, error: 'leccionId inválido' }
    }

    const db = mongoose.connection.db
    if (!db) {
      return { success: false, error: 'DB no conectada' }
    }
    const leccion = await db.collection('lecciones').findOne({ _id: lid })
    if (!leccion) return { success: false, error: 'La lección no existe' }

    const curso = await db.collection('cursos').findOne({ _id: leccion.curso_id })

    const hermanas = await db
      .collection('lecciones')
      .find({ curso_id: leccion.curso_id })
      .sort({ numero: 1 })
      .toArray()
    const idx = hermanas.findIndex((l: any) => l._id.toString() === lid.toString())
    const anterior = idx > 0 ? hermanas[idx - 1] : null
    const siguiente = idx >= 0 && idx < hermanas.length - 1 ? hermanas[idx + 1] : null

    let completada = false
    if (usuarioId) {
      try {
        const uid = toObjectId(usuarioId)
        const insc = await db
          .collection('inscripciones')
          .findOne({ usuario_id: uid, curso_id: leccion.curso_id })
        completada = !!(
          insc &&
          (insc.lecciones_completadas || []).some((x: any) => x.toString() === lid.toString())
        )
      } catch {
        // usuarioId inválido
      }
    }

    return {
      success: true,
      data: {
        id: leccion._id.toString(),
        numero: leccion.numero ?? null,
        titulo: leccion.titulo,
        videoUrl: leccion.video_url || null,
        contenido: leccion.contenido_text || leccion.contenido || null,
        duracion: typeof leccion.duracion_minutos === 'number' ? leccion.duracion_minutos : null,
        cursoId: leccion.curso_id ? leccion.curso_id.toString() : null,
        cursoNombre: curso ? curso.nombre : 'Curso no disponible',
        anteriorId: anterior ? (anterior as any)._id.toString() : null,
        siguienteId: siguiente ? (siguiente as any)._id.toString() : null,
        completada,
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('leccion:completar', async (_, { leccionId } = {}) => {
  try {
    const usuarioId = getUsuarioId()
    if (!usuarioId) {
      return { success: false, error: 'No hay sesión iniciada' }
    }
    if (!leccionId) {
      return { success: false, error: 'leccionId requerido' }
    }
    let uid, lid
    try {
      uid = toObjectId(usuarioId)
      lid = toObjectId(leccionId)
    } catch {
      return { success: false, error: 'Identificador inválido' }
    }

    const db = mongoose.connection.db
    if (!db) {
      return { success: false, error: 'DB no conectada' }
    }
    const leccion = await db.collection('lecciones').findOne({ _id: lid })
    if (!leccion) return { success: false, error: 'La lección no existe' }

    const insc = await db
      .collection('inscripciones')
      .findOne({ usuario_id: uid, curso_id: leccion.curso_id })
    if (!insc) return { success: false, error: 'No estás inscrito en este curso' }

    const total = await db.collection('lecciones').countDocuments({ curso_id: leccion.curso_id })
    if (total <= 0) {
      await db.collection('inscripciones').updateOne(
        { _id: insc._id },
        { $addToSet: { lecciones_completadas: lid }, $set: { progreso: 0 } }
      )
    } else {
      await db.collection('inscripciones').updateOne(
        { _id: insc._id },
        [
          {
            $set: {
              lecciones_completadas: { $setUnion: ['$lecciones_completadas', [lid]] },
            },
          },
          {
            $set: {
              progreso: {
                $round: [
                  { $multiply: [{ $divide: [{ $size: '$lecciones_completadas' }, total] }, 100] },
                  0,
                ],
              },
            },
          },
        ]
      )
    }

    const inscActualizada = await db.collection('inscripciones').findOne({ _id: insc._id })
    const progreso = inscActualizada?.progreso || 0

    return { success: true, data: { progreso, completada: true } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('comentario:listar', async (_, leccionId) => {
  try {
    if (!leccionId) return { success: false, error: 'leccionId requerido' }
    let lid
    try {
      lid = toObjectId(leccionId)
    } catch {
      return { success: false, error: 'leccionId inválido' }
    }

    const db = mongoose.connection.db
    if (!db) {
      return { success: false, error: 'DB no conectada' }
    }
    const docs = await db
      .collection('comentarios')
      .find({ leccion_id: lid })
      .sort({ _id: -1 })
      .limit(5)
      .toArray()

    const autorIds = Array.from(new Set(docs.map((d: any) => d.usuario_id?.toString()).filter(Boolean)))
    const nombrePorId = new Map<string, string>()
    if (autorIds.length) {
      const ids = autorIds.map((s: any) => new mongoose.Types.ObjectId(s))
      const usuarios = await db
        .collection('usuarios')
        .find({ _id: { $in: ids } }, { projection: { nombre: 1 } })
        .toArray()
      for (const u of usuarios) nombrePorId.set(u._id.toString(), u.nombre)
    }

    const data = docs.map((c: any) => ({
      id: c._id.toString(),
      texto: c.texto,
      autor: nombrePorId.get(c.usuario_id?.toString()) || 'Usuario desconocido',
      fecha: c.fecha ? new Date(c.fecha).toISOString() : null,
    }))

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('comentario:crear', async (_, { leccionId, texto } = {}) => {
  try {
    const usuarioId = getUsuarioId()
    if (!usuarioId) {
      return { success: false, error: 'No hay sesión iniciada' }
    }
    if (!leccionId || !texto || !texto.trim()) {
      return { success: false, error: 'Faltan datos del comentario' }
    }
    let lid, uid
    try {
      lid = toObjectId(leccionId)
      uid = toObjectId(usuarioId)
    } catch {
      return { success: false, error: 'Identificador inválido' }
    }

    const db = mongoose.connection.db
    if (!db) {
      return { success: false, error: 'DB no conectada' }
    }
    if (!(await db.collection('lecciones').findOne({ _id: lid }))) {
      return { success: false, error: 'La lección no existe' }
    }

    const r = await db.collection('comentarios').insertOne({
      leccion_id: lid,
      usuario_id: uid,
      texto: texto.trim(),
      fecha: new Date(),
    })
    return { success: true, data: { id: r.insertedId.toString() } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
