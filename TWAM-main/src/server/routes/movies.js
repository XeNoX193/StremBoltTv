import express from 'express';
import multer from 'multer';
import Movie from '../models/Movie.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// POST /api/movies
router.post('/', upload.single('poster_path'), async (req, res) => {
    try {
        const {
            id,
            title,
            release_date,
            original_language,
            genre_ids,
            vote_average,
            overview
        } = req.body;

        const poster_path = req.file ? '/uploads/' + req.file.filename : '';

        const genreIdsArray = genre_ids
            ? Array.isArray(genre_ids)
                ? genre_ids.map(Number)
                : JSON.parse(genre_ids)
            : [];

        const movie = new Movie({
            id,
            title,
            poster_path,
            release_date,
            original_language,
            genre_ids: genreIdsArray,
            vote_average: parseFloat(vote_average),
            overview
        });

        await movie.save();
        res.status(201).json(movie);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/movies/search?query=...
router.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);
    try {
        const movies = await Movie.find(
            { title: { $regex: query, $options: 'i' } },
            {
                id: 1,
                title: 1,
                poster_path: 1,
                release_date: 1,
                original_language: 1,
                genre_ids: 1,
                vote_average: 1,
                overview: 1
            }
        )
        res.json(movies);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

//GET para listar todos os filmes do mondoDB (locais)
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movie);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE para remover um filme pelo ID do servidor local
router.delete('/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ message: 'Movie deleted successfully' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});




export default router;