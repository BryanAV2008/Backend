// src/models/Review.js
import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Game', // Hace referencia al modelo 'Game'
    },
    author: {
      type: String,
      default: 'Anónimo',
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // La puntuación mínima es 1 estrella
      max: 5,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;