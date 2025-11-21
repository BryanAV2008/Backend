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
  comment: { // <-- Confirma que se llama 'comment' aquí en el modelo
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Anónimo',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Review', reviewSchema);