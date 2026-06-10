import { Schema, model } from 'mongoose'

// ======================================================
// User Model — Mongoose
// Modelo de usuario para la base de datos local MongoDB
// ======================================================

export interface IUser {
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  createdAt?: Date
  updatedAt?: Date
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

export const User = model<IUser>('User', userSchema)
