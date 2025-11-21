// GAMETRACKER-Backend/src/controllers/reviewController.js
import Review from '../models/Review.js';
import Game from '../models/Game.js'; // Importamos Game para usar en getStats
import mongoose from 'mongoose'; // Importamos mongoose para validaciones de ObjectId

// @desc    Obtener todas las reseñas
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    // Populate el campo 'game' para obtener el título
    const reviews = await Review.find({})
      .populate('game', 'title'); // Solo trae el 'title' del juego
    
    // Mapear las reseñas para incluir gameTitle directamente
    const formattedReviews = reviews.map(review => ({
      ...review.toObject(),
      gameTitle: review.game ? review.game.title : 'Juego Desconocido' // Añade gameTitle
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error("Error en getReviews:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear una nueva reseña
// @route   POST /api/reviews
// @access  Private (se puede añadir autenticación en el futuro)
const createReview = async (req, res) => {
  const { game, author, rating, comment } = req.body;

  if (!game || !author || rating === undefined || !comment) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios: game, author, rating, comment.' });
  }

  try {
    // Opcional: Validar que el 'game' ID sea un ObjectId válido y exista
    if (!mongoose.Types.ObjectId.isValid(game)) {
        return res.status(400).json({ message: 'ID de juego inválido.' });
    }
    const existingGame = await Game.findById(game);
    if (!existingGame) {
        return res.status(404).json({ message: 'Juego no encontrado para asociar la reseña.' });
    }

    const review = new Review({
      game,
      author,
      rating,
      comment,
    });

    const createdReview = await review.save();
    // Después de guardar, poblamos para devolver la reseña completa con el título del juego
    const populatedReview = await Review.findById(createdReview._id).populate('game', 'title');
    
    // Formatear la reseña para incluir gameTitle
    const formattedReview = {
        ...populatedReview.toObject(),
        gameTitle: populatedReview.game ? populatedReview.game.title : 'Juego Desconocido'
    };

    res.status(201).json(formattedReview);
  } catch (error) {
    console.error("Error en createReview:", error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtener una reseña por ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    // Validar si el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de reseña inválido.' });
    }

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
    console.error(`Error en getReviewById para ID ${req.params.id}: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Formato de ID de reseña incorrecto.' });
    }
    res.status(500).json({ message: 'Error del servidor al obtener la reseña.' });
  }
};

// @desc    Actualizar una reseña
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  const { author, rating, comment, game } = req.body; // Incluimos 'game' si permitimos cambiarlo en la edición

  try {
    // Validar si el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de reseña inválido para actualizar.' });
    }

    const review = await Review.findById(req.params.id);

    if (review) {
      // Opcional: Validar el nuevo 'game' ID si se proporciona
      if (game && !mongoose.Types.ObjectId.isValid(game)) {
          return res.status(400).json({ message: 'Nuevo ID de juego inválido.' });
      }
      if (game) { // Solo actualiza si se proporciona un nuevo game ID
          const existingGame = await Game.findById(game);
          if (!existingGame) {
              return res.status(404).json({ message: 'Nuevo juego no encontrado para asociar la reseña.' });
          }
          review.game = game;
      }

      review.author = author !== undefined ? author : review.author;
      review.rating = rating !== undefined ? rating : review.rating;
      review.comment = comment !== undefined ? comment : review.comment;

      const updatedReview = await review.save();
      // Después de guardar, poblamos para devolver la reseña completa con el título del juego
      const populatedReview = await Review.findById(updatedReview._id).populate('game', 'title');

      // Formatear la reseña para incluir gameTitle
      const formattedReview = {
        ...populatedReview.toObject(),
        gameTitle: populatedReview.game ? populatedReview.game.title : 'Juego Desconocido'
      };

      res.json(formattedReview);
    } else {
      res.status(404).json({ message: 'Reseña no encontrada para actualizar.' });
    }
  } catch (error) {
    console.error(`Error en updateReview para ID ${req.params.id}: ${error.message}`);
    if (error.name === 'CastError' || error.name === 'ValidationError') {
      const messages = error.name === 'CastError' ? 'Formato de ID de reseña incorrecto.' : Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Eliminar una reseña
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    // Validar si el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de reseña inválido para eliminar.' });
    }

    const review = await Review.findById(req.params.id);

    if (review) {
      await Review.deleteOne({ _id: req.params.id });
      res.json({ message: 'Reseña eliminada' });
    } else {
      res.status(404).json({ message: 'Reseña no encontrada para eliminar.' });
    }
  } catch (error) {
    console.error(`Error en deleteReview para ID ${req.params.id}: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Formato de ID de reseña incorrecto.' });
    }
    res.status(500).json({ message: error.message });
  }
};


// @desc    Obtener estadísticas globales de juego y reseña
// @route   GET /api/stats
// @access  Public
const getStats = async (req, res) => {
    try {
        // --- Cálculo de Puntuación Media Global, Total de Reseñas y Juegos Únicos Reseñados ---
        const overallReviewStats = await Review.aggregate([
            {
                $group: {
                    _id: null, // Agrupa todo en un solo documento para estadísticas globales
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    uniqueGamesReviewed: { $addToSet: '$game' } // Guarda los IDs únicos de los juegos reseñados
                }
            },
            {
                $project: {
                    _id: 0,
                    avgRating: { $round: ['$avgRating', 1] }, // Redondea a 1 decimal
                    totalReviews: 1,
                    totalGamesReviewedCount: { $size: '$uniqueGamesReviewed' } // Cuenta los juegos únicos reseñados
                }
            }
        ]);

        const reviewStats = overallReviewStats[0] || {}; // Tomamos el primer (y único) resultado, si existe

        // --- Cálculo de Horas Jugadas ---
        // Suma el campo 'hoursPlayed' de TODOS los juegos existentes.
        const games = await Game.find({});
        const totalHoursPlayed = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0);

        // --- Cálculo del Género Más Popular ---
        const mostPlayedGenreResult = await Review.aggregate([
            {
                $lookup: {
                    from: 'games', // El nombre de la colección de juegos en tu DB (normalmente plural y minúsculas)
                    localField: 'game',
                    foreignField: '_id',
                    as: 'gameDetails'
                }
            },
            {
                $unwind: '$gameDetails' // Deshace el array 'gameDetails'
            },
            {
                $group: {
                    _id: '$gameDetails.genre', // Agrupa por género del juego
                    count: { $sum: 1 } // Cuenta las reseñas por género
                }
            },
            {
                $sort: { count: -1 } // Ordena de mayor a menor
            },
            {
                $limit: 1 // Toma el género con más reseñas
            },
            {
                $project: {
                    _id: 0,
                    mostPlayedGenre: '$_id'
                }
            }
        ]);

        const mostPlayedGenre = mostPlayedGenreResult[0]?.mostPlayedGenre || 'N/A';

        // --- Estructura final de las estadísticas para el frontend ---
        const finalStats = {
            totalGames: reviewStats.totalGamesReviewedCount || 0, // Total de juegos que han sido reseñados
            // Asumo que "Juegos Completados" se refiere al total de reseñas
            // Si tiene otra definición (ej: juegos con rating > 3), ajusta aquí.
            completedGames: reviewStats.totalReviews || 0, 
            avgRating: reviewStats.avgRating || null,
            totalHoursPlayed: totalHoursPlayed,
            mostPlayedGenre: mostPlayedGenre,
        };

        res.json(finalStats);

    } catch (error) {
        console.error("Error en getStats:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export {
  getReviews,
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  getStats, // Asegúrate de exportar getStats
};