import mongoose from 'mongoose'

// Conecta a MongoDB. Ante un fallo NO mata el proceso: la ventana se abre igual y
// las vistas muestran su estado de error (los handlers devuelven success:false),
// en vez de cerrarse sin avisar. Devuelve true/false segun el resultado.
export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduplatform'
    await mongoose.connect(mongoUri)
    console.log('MongoDB conectado')
    return true
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message)
    return false
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect()
    console.log('MongoDB desconectado')
  } catch (error) {
    console.error('Error desconectando de MongoDB:', error.message)
  }
}
