/* global process */
import express from 'express';
import mongoose from 'mongoose';
import pendingRoutes from './routes/pending.js';
import approveRoutes from './routes/approve.js';
import cors from 'cors';
import notApprovedRouter from './routes/notapproved.js';
import moviesRouter from './routes/movies.js';

//Carregar variáveis de ambiente do arquivo .env
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/streambolt';

//Middleware, faz com que o express entenda JSON e habilite CORS
app.use(express.json());
app.use(cors());


//Rotas de comentários
app.use('/api/comments/pending', pendingRoutes);
app.use('/api/comments/approve', approveRoutes);
app.use('/api/comments/notapproved', notApprovedRouter);

//Rotas de filmes
app.use('/api/movies', moviesRouter);

app.use('/uploads', express.static('uploads'));

//Conecta ao MongoDB e inicia o servidor
mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });