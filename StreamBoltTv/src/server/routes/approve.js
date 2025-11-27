import express from 'express';
import Comment from '../models/Comment.js';

const router = express.Router();

//PATCH para colocar como aprovado um comentário pendente
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndUpdate(
            id,
            { approved: true },
            { new: true }
        );
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to approve comment' });
    }
});

//GET para buscar todos os comentários aprovados de um filme específico (por id)
router.get('/:movieId', async (req, res) => {
    try {
        const comments = await Comment.find({
            movieId: req.params.movieId,
            approved: true
        });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE para remover um comentário previamente aprovado
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Comment.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

export default router;