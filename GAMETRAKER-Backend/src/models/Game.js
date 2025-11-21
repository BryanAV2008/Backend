// GAMETRACKER-Backend/src/models/Game.js
import mongoose from 'mongoose';

const gameSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    genre: { type: String },
    platform: { type: String },
    releaseDate: { type: Date },
    developer: { type: String },
    publisher: { type: String },
    description: { type: String },
    imageUrl: { type: String }, // O coverImageUrl
    hoursPlayed: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 } // <-- ¡Asegúrate de que sea Number!
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model('Game', gameSchema);
export default Game;