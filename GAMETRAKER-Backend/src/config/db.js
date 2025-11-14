// src/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde .env

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Opciones de conexión recomendadas (pueden variar ligeramente en versiones futuras de Mongoose)
      // useNewUrlParser: true, // Ya no es necesario en Mongoose 6+
      // useUnifiedTopology: true, // Ya no es necesario en Mongoose 6+
    });
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1); // Sale del proceso con un error
  }
};

export default connectDB;