import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

// Conecta a MongoDB. Devuelve true/false segun el resultado.
export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduplatform'
    await mongoose.connect(mongoUri, {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
    console.log('MongoDB conectado')
    return true
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message)
    return false
  }
}

export async function disconnectDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
      console.log('MongoDB desconectado')
    }
  } catch (error) {
    console.error('Error desconectando de MongoDB:', error.message)
  }
}
