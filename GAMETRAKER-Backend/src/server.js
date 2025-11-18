// src/server.js
import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config(); // Carga las variables de entorno

const PORT = process.env.PORT || 5000; 

// Conectar a la base de datos
connectDB();

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});