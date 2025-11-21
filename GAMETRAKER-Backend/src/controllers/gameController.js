// GAMETRACKER-Backend/src/controllers/gameController.js
import Game from '../models/Game.js';
import mongoose from 'mongoose'; // <-- ¡Importante: importamos mongoose aquí!

// @desc    Obtener todos los juegos
// @route   GET /api/games
// @access  Public
const getGames = async (req, res) => {
  try {
    const games = await Game.find({});
    res.json(games);
  } catch (error) {
    console.error("Error en getGames:", error.message); // Mejor registro de errores
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener un juego por ID
// @route   GET /api/games/:id
// @access  Public
const getGameById = async (req, res) => {
  try {
    // *** CAMBIO CLAVE AQUÍ: Validar si el ID es un ObjectId válido ***
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido.' });
    }

    const game = await Game.findById(req.params.id);
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ message: 'Juego no encontrado.' });
    }
  } catch (error) {
    console.error(`Error en getGameById para ID ${req.params.id}: ${error.message}`); // Mensaje de error detallado
    // También puedes añadir una verificación para errores de CastError específicos de Mongoose aquí
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Formato de ID de juego incorrecto.' });
    }
    res.status(500).json({ message: 'Error del servidor al obtener el juego.' });
  }
};

// @desc    Crear un nuevo juego
// @route   POST /api/games
// @access  Private (se puede añadir autenticación en el futuro)
const createGame = async (req, res) => {
  const { title, genre, platform, releaseDate, coverImageUrl, description, completed, hoursPlayed, rating } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'El título del juego es obligatorio' });
  }

  try {
    const game = new Game({
      title,
      genre,
      platform,
      releaseDate,
      coverImageUrl,
      description,
      completed,
      hoursPlayed,
      rating,
    });

    const createdGame = await game.save();
    res.status(201).json(createdGame);
  } catch (error) {
    console.error("Error en createGame:", error.message); // Mejor registro de errores
    // Si hay un error de validación de Mongoose, lo capturamos
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar un juego
// @route   PUT /api/games/:id
// @access  Private
const updateGame = async (req, res) => {
  const { title, genre, platform, releaseDate, coverImageUrl, description, completed, hoursPlayed, rating } = req.body;

  try {
    // Validar si el ID es un ObjectId válido antes de buscar
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido.' });
    }

    const game = await Game.findById(req.params.id);

    if (game) {
      game.title = title !== undefined ? title : game.title;
      game.genre = genre !== undefined ? genre : game.genre;
      game.platform = platform !== undefined ? platform : game.platform;
      game.releaseDate = releaseDate !== undefined ? releaseDate : game.releaseDate;
      game.coverImageUrl = coverImageUrl !== undefined ? coverImageUrl : game.coverImageUrl;
      game.description = description !== undefined ? description : game.description;
      game.completed = completed !== undefined ? completed : game.completed;
      game.hoursPlayed = hoursPlayed !== undefined ? hoursPlayed : game.hoursPlayed;
      game.rating = rating !== undefined ? rating : game.rating;

      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    console.error(`Error en updateGame para ID ${req.params.id}: ${error.message}`); // Mejor registro de errores
    if (error.name === 'CastError' || error.name === 'ValidationError') {
      const messages = error.name === 'CastError' ? 'Formato de ID de juego incorrecto.' : Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Eliminar un juego
// @route   DELETE /api/games/:id
// @access  Private
const deleteGame = async (req, res) => {
  try {
    // Validar si el ID es un ObjectId válido antes de buscar
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido.' });
    }

    const game = await Game.findById(req.params.id);

    if (game) {
      await Game.deleteOne({ _id: req.params.id }); // Mongoose 6+
      res.json({ message: 'Juego eliminado' });
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    console.error(`Error en deleteGame para ID ${req.params.id}: ${error.message}`); // Mejor registro de errores
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Formato de ID de juego incorrecto.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar estado de completado de un juego
// @route   PATCH /api/games/:id/completed
// @access  Private
const updateGameCompletedStatus = async (req, res) => {
  const { completed } = req.body;

  try {
    // Validar si el ID es un ObjectId válido antes de buscar
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido.' });
    }

    const game = await Game.findById(req.params.id);
    if (game) {
      game.completed = completed !== undefined ? completed : game.completed; // Permite false explícitamente
      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    console.error(`Error en updateGameCompletedStatus para ID ${req.params.id}: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Formato de ID de juego incorrecto.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar puntuación de un juego
// @route   PATCH /api/games/:id/rating
// @access  Private
const updateGameRating = async (req, res) => {
  const { rating } = req.body;

  try {
    // Validar si el ID es un ObjectId válido antes de buscar
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido.' });
    }

    const game = await Game.findById(req.params.id);
    if (game) {
      game.rating = rating !== undefined ? rating : game.rating;
      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    console.error(`Error en updateGameRating para ID ${req.params.id}: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Formato de ID de juego incorrecto.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar horas jugadas de un juego
// @route   PATCH /api/games/:id/hoursPlayed
// @access  Private
const updateGameHoursPlayed = async (req, res) => {
  const { hoursPlayed } = req.body;

  try {
    // Validar si el ID es un ObjectId válido antes de buscar
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido.' });
    }

    const game = await Game.findById(req.params.id);
    if (game) {
      game.hoursPlayed = hoursPlayed !== undefined ? hoursPlayed : game.hoursPlayed;
      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    console.error(`Error en updateGameHoursPlayed para ID ${req.params.id}: ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Formato de ID de juego incorrecto.' });
    }
    res.status(400).json({ message: error.message });
  }
};


export {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  updateGameCompletedStatus,
  updateGameRating,
  updateGameHoursPlayed
};