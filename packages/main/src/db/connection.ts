import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

export async function connectDB(): Promise<boolean> {
  try {
    const mongoUri = process.env.MONGODB_URI
    
    if (!mongoUri) {
      throw new Error('La variable de entorno MONGODB_URI no está definida.')
    }

    await mongoose.connect(mongoUri, {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
    console.log('MongoDB conectado exitosamente')
    return true
  } catch (error: any) {
    console.error('Error conectando a MongoDB:', error.message)
    return false
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
      console.log('MongoDB desconectado')
    }
  } catch (error: any) {
    console.error('Error desconectando de MongoDB:', error.message)
  }
}
