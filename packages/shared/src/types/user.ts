// ======================================================
// SHARED TYPES — User
// Interfaz compartida entre main (Mongoose) y frontend (React)
// ======================================================

export interface IUser {
  _id?: string
  name: string
  email: string
  password?: string
  role: 'admin' | 'teacher' | 'student'
  createdAt?: Date
  updatedAt?: Date
}

export type CreateUserDTO = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>
export type UpdateUserDTO = Partial<CreateUserDTO>

// DTOs for authentication
export interface RegisterDTO {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: 'admin' | 'teacher' | 'student'
}

export interface LoginDTO {
  email: string
  password: string
}

export interface AuthResponse {
  success: true
  data: Omit<IUser, 'password'>
  message: string
}

export interface ErrorResponse {
  success: false
  error: string
}
