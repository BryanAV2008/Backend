// GAMETRACKER-Backend/src/controllers/reviewController.js
import Review from '../models/Review.js';
import Game from '../models/Game.js'; // Necesario para populate, si no se usara aquí, se podría quitar
import mongoose from 'mongoose'; // <-- ¡Importante: importamos mongoose aquí!

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
    // *** CAMBIO CLAVE AQUÍ: Validar si el ID es un ObjectId válido ***
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
    // *** CAMBIO CLAVE AQUÍ: Validar si el ID es un ObjectId válido ***
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
    // *** CAMBIO CLAVE AQUÍ: Validar si el ID es un ObjectId válido ***
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


// @desc    Obtener estadísticas de reseñas
// @route   GET /api/reviews/stats
// @access  Public
const getStats = async (req, res) => {
    try {
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: '$game',
                    avgRating: { $avg: '$rating' },
                    numReviews: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'games', // El nombre de la colección de juegos en tu DB (plural, minúsculas)
                    localField: '_id',
                    foreignField: '_id',
                    as: 'gameDetails'
                }
            },
            {
                $unwind: '$gameDetails' // Deshace el array 'gameDetails'
            },
            {
                $project: {
                    _id: 0, // No queremos el ID del grupo
                    gameId: '$_id',
                    gameTitle: '$gameDetails.title', // Trae el título del juego
                    avgRating: { $round: ['$avgRating', 1] }, // Redondea a 1 decimal
                    numReviews: 1
                }
            }
        ]);
        res.json(stats);
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
  getStats,
};