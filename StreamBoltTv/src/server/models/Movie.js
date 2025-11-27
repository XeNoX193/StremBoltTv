import mongoose from "mongoose";

//Define o esquema do modelo de filme
const MovieSchema = new mongoose.Schema({
    id: { type: String, required: false }, // Optional, MongoDB uses _id
    title: { type: String, required: true },
    poster_path: { type: String, required: true },
    release_date: { type: String, required: true },
    original_language: { type: String, required: true },
    genre_ids: { type: [Number], required: true }, // Array of numbers
    vote_average: { type: Number, required: true },
    overview: { type: String, required: true }
});

export default mongoose.model('Movie', MovieSchema);