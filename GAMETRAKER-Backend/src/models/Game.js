// src/models/Game.js
import mongoose from 'mongoose';

const gameSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Elimina espacios en blanco al inicio/final
    },
    genre: {
      type: String,
      trim: true,
    },
    platform: {
      type: String,
      trim: true,
    },
    releaseDate: {
      type: Date,
    },
    coverImageUrl: {
      type: String,
      default: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=No+Cover', // Imagen por defecto
    },
    description: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    hoursPlayed: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
  }
);

const Game = mongoose.model('Game', gameSchema);

export default Game;