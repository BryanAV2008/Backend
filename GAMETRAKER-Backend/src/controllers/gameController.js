// src/controllers/gameController.js
import Game from '../models/Game.js';

// @desc    Obtener todos los juegos
// @route   GET /api/games
// @access  Public
const getGames = async (req, res) => {
  try {
    const games = await Game.find({});
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener un juego por ID
// @route   GET /api/games/:id
// @access  Public
const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar un juego
// @route   PUT /api/games/:id
// @access  Private
const updateGame = async (req, res) => {
  const { title, genre, platform, releaseDate, coverImageUrl, description, completed, hoursPlayed, rating } = req.body;

  try {
    const game = await Game.findById(req.params.id);

    if (game) {
      game.title = title || game.title;
      game.genre = genre || game.genre;
      game.platform = platform || game.platform;
      game.releaseDate = releaseDate || game.releaseDate;
      game.coverImageUrl = coverImageUrl || game.coverImageUrl;
      game.description = description || game.description;
      game.completed = completed !== undefined ? completed : game.completed;
      game.hoursPlayed = hoursPlayed !== undefined ? hoursPlayed : game.hoursPlayed;
      game.rating = rating !== undefined ? rating : game.rating;

      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Eliminar un juego
// @route   DELETE /api/games/:id
// @access  Private
const deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (game) {
      await Game.deleteOne({ _id: req.params.id }); // Mongoose 6+
      res.json({ message: 'Juego eliminado' });
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar estado de completado de un juego
// @route   PATCH /api/games/:id/completed
// @access  Private
const updateGameCompletedStatus = async (req, res) => {
  const { completed } = req.body;

  try {
    const game = await Game.findById(req.params.id);
    if (game) {
      game.completed = completed;
      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar puntuación de un juego
// @route   PATCH /api/games/:id/rating
// @access  Private
const updateGameRating = async (req, res) => {
  const { rating } = req.body;

  try {
    const game = await Game.findById(req.params.id);
    if (game) {
      game.rating = rating;
      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar horas jugadas de un juego
// @route   PATCH /api/games/:id/hoursPlayed
// @access  Private
const updateGameHoursPlayed = async (req, res) => {
  const { hoursPlayed } = req.body;

  try {
    const game = await Game.findById(req.params.id);
    if (game) {
      game.hoursPlayed = hoursPlayed;
      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Juego no encontrado' });
    }
  } catch (error) {
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