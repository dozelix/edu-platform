import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

// ======================================================
// User Model — Mongoose
// Modelo de usuario para la base de datos local MongoDB
// Con autenticación y contraseñas hasheadas
// ======================================================

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'teacher' | 'student'
  createdAt?: Date
  updatedAt?: Date
  comparePassword(plainPassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false, // No incluir por defecto en queries
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
)

// Hash password antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (plainPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, this.password)
}

export const User = model<IUser>('User', userSchema)
