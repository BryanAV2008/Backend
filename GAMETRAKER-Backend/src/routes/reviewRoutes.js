// src/routes/reviewRoutes.js
import express from 'express';
const router = express.Router();
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getStats, // Importamos getStats aquí
} from '../controllers/reviewController.js';

// Rutas para /api/reviews
router.route('/')
  .get(getReviews)
  .post(createReview);

router.route('/:id')
  .get(getReviewById)
  .put(updateReview)
  .delete(deleteReview);

// Ruta para las estadísticas (puede ir aquí o en su propio archivo si crece mucho)
router.get('/stats', getStats); // Se accederá como /api/reviews/stats (o /api/stats si se define en app.js)

export default router;