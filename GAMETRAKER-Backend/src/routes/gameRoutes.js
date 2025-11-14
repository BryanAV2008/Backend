// src/routes/gameRoutes.js
import express from 'express';
const router = express.Router();
import {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  updateGameCompletedStatus,
  updateGameRating,
  updateGameHoursPlayed
} from '../controllers/gameController.js';

// Rutas para /api/games
router.route('/')
  .get(getGames)
  .post(createGame); // Crear un juego

router.route('/:id')
  .get(getGameById)
  .put(updateGame)   // Actualizar un juego
  .delete(deleteGame); // Eliminar un juego

// Rutas PATCH para actualizaciones parciales
router.patch('/:id/completed', updateGameCompletedStatus);
router.patch('/:id/rating', updateGameRating);
router.patch('/:id/hoursPlayed', updateGameHoursPlayed);

export default router;