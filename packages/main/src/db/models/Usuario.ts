import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tipo: { type: String, enum: ['estudiante', 'instructor'], default: 'estudiante' },
    password: { type: String, minlength: 6, select: false },
  },
  { collection: 'usuarios' }
)

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

usuarioSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password)
}

export const Usuario = model('Usuario', usuarioSchema)
