import express from 'express';
import Comment from '../models/Comment.js';

const router = express.Router();

// POST para criar um novo comentário (fica pendente)
router.post('/', async (req, res) => {
    try {
        const { movieId, user, text } = req.body;
        const comment = new Comment({ movieId, user, text, approved: false });
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save comment' });
    }
});

// GET para buscar todos os comentários pendentes
router.get('/', async (req, res) => {
    try {
        const pendingComments = await Comment.find({ approved: false });
        res.json(pendingComments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// PATCH para editar um comentário pendente
// (se for aprovado, vai para a rota "approve")
// (se não for aprovado, vai para a rota "notapproved")
router.patch('/:id/approve', async (req, res) => {
    try {
        const { approved } = req.body;
        // Ensure approved is a boolean
        if (typeof approved !== 'boolean') {
            return res.status(400).json({ error: '`approved` must be a boolean' });
        }
        const updated = await Comment.findByIdAndUpdate(
            req.params.id,
            { approved },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

export default router;