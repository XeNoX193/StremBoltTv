import mongoose from 'mongoose';

//Define o esquema do modelo de comentário
const commentSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    user: { type: String, required: true },
    text: { type: String, required: true },
    approved: { type: Boolean, default: false }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;