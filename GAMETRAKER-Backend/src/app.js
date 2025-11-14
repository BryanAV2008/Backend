// src/app.js
import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js'; // Importamos reviewRoutes
import { getStats } from './controllers/reviewController.js'; // Importamos getStats directamente

const app = express();

// Middleware
app.use(cors()); // Permite solicitudes de diferentes orígenes (frontend)
app.use(express.json()); // Permite que Express parse el cuerpo de las solicitudes JSON

// Rutas API
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);

// Ruta específica para estadísticas, si no quieres que sea /api/reviews/stats
app.get('/api/stats', getStats);


// Ruta de bienvenida (opcional)
app.get('/', (req, res) => {
  res.send('API de GameTracker en funcionamiento!');
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  const error = new Error(`No encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware para manejo de errores general
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;