import express from 'express';
import Comment from '../models/Comment.js';

const router = express.Router();

// DELETE para remover um comentário não aprovado
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Comment.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Comment not found' });
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;