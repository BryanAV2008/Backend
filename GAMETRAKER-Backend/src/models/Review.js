// GAMETRACKER-Backend/src/models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: { // <-- Importante que se llame 'comment' aquí
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Anónimo', // Asegúrate de que este campo exista si lo esperas
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Review', reviewSchema);