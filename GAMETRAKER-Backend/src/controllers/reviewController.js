// src/controllers/reviewController.js
import Review from '../models/Review.js';
import Game from '../models/Game.js'; // Necesario para poblar el título del juego

// @desc    Obtener todas las reseñas
// @route   GET /api/reviews
// @access  Public 
const getReviews = async (req, res) => {
  try {
    // Usamos populate para obtener los detalles del juego asociado a la reseña
    const reviews = await Review.find({}).populate('game', 'title'); // Solo queremos el título del juego
    // Ajustar el formato para el frontend, añadiendo gameTitle directamente
    const formattedReviews = reviews.map(review => ({
        ...review.toObject(),
        gameTitle: review.game ? review.game.title : 'Juego Desconocido'
    }));
    res.json(formattedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener una reseña por ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('game', 'title');
    if (review) {
        const formattedReview = {
            ...review.toObject(),
            gameTitle: review.game ? review.game.title : 'Juego Desconocido'
        };
      res.json(formattedReview);
    } else {
      res.status(404).json({ message: 'Reseña no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear una nueva reseña
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  const { game, author, rating, content } = req.body;

  if (!game || !rating || !content) {
    return res.status(400).json({ message: 'Game ID, puntuación y contenido son obligatorios para la reseña' });
  }

  // Verificar que el juego exista
  const existingGame = await Game.findById(game);
  if (!existingGame) {
      return res.status(404).json({ message: 'El juego al que intentas reseñar no existe.' });
  }

  try {
    const review = new Review({
      game,
      author,
      rating,
      content,
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar una reseña
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  const { author, rating, content } = req.body; // No permitimos cambiar el juego al que pertenece una reseña en PUT

  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      review.author = author || review.author;
      review.rating = rating !== undefined ? rating : review.rating;
      review.content = content || review.content;

      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Reseña no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Eliminar una reseña
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      await Review.deleteOne({ _id: req.params.id });
      res.json({ message: 'Reseña eliminada' });
    } else {
      res.status(404).json({ message: 'Reseña no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener estadísticas generales (total games, completed, avg rating, etc.)
// @route   GET /api/stats
// @access  Public
const getStats = async (req, res) => {
    try {
        const totalGames = await Game.countDocuments();
        const completedGames = await Game.countDocuments({ completed: true });

        const avgRatingResult = await Game.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);
        const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

        const totalHoursPlayedResult = await Game.aggregate([
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: '$hoursPlayed' }
                }
            }
        ]);
        const totalHoursPlayed = totalHoursPlayedResult.length > 0 ? totalHoursPlayedResult[0].totalHours : 0;

        const mostPlayedGenreResult = await Game.aggregate([
            { $group: { _id: '$genre', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const mostPlayedGenre = mostPlayedGenreResult.length > 0 ? mostPlayedGenreResult[0]._id : 'N/A';


        res.json({
            totalGames,
            completedGames,
            avgRating,
            totalHoursPlayed,
            mostPlayedGenre
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getStats,
};