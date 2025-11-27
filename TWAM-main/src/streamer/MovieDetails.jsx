import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../App.css';
import { getApiKey, getName } from '../configs.js';
import { languageMap } from "../data.js";
import TopBar from "../components/TopBar.jsx";
import IconLetra from "../components/IconLetra.jsx";
import Footer from "../components/Footer.jsx";

function MovieDetails() {
    const user = getName();
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [text, setText] = useState('');
    const [message, setMessage] = useState('');
    const [approvedComments, setApprovedComments] = useState([]);
    const [genres, setGenres] = useState([]);
    const [error, setError] = useState('');

    // Os géneros são carregados uma vez no início para evitar múltiplas chamadas à API
    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${getApiKey()}&language=en-US`)
            .then(res => res.json())
            .then(data => setGenres(data.genres || []));
    }, []);

    // Obtém os nomes dos géneros a partir do objeto movie
    function getGenreNames(movie) {
        if (movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0) {
            if (typeof movie.genres[0] === 'object') {
                return movie.genres.map(g => g.name).filter(Boolean).join(', ');
            }
            return movie.genres.join(', ');
        }
        if (movie.genre_ids && Array.isArray(movie.genre_ids) && genres.length > 0) {
            return movie.genre_ids
                .map(id => genres.find(g => g.id === id)?.name)
                .filter(Boolean)
                .join(', ');
        }
        return '';
    }

    // Normaliza o caminho do poster para garantir que é sempre um URL válido
    function normalizePosterPath(movie) {
        let poster_path = movie.poster_path;
        if (poster_path && poster_path.startsWith && poster_path.startsWith('/uploads/')) {
            poster_path = `http://localhost:5000${poster_path}`;
        } else if (poster_path && !poster_path.startsWith('http')) {
            poster_path = `https://image.tmdb.org/t/p/w300${poster_path}`;
        }
        return { ...movie, poster_path };
    }

    // Carrega os detalhes do filme e comentários quando o ID do filme muda
    useEffect(() => {
        if (!id) return;
        setError('');
        setMovie(null);

        // Função para buscar os detalhes do filme do TMdb e do servidor mongoDB
        const fetchMovie = async () => {
            try {
                // Check if id is a MongoDB ObjectId (24 hex chars)
                const isMongoId = /^[a-f\d]{24}$/i.test(id);
                let data, res;
                if (isMongoId) {
                    res = await fetch(`http://localhost:5000/api/movies/${id}`);
                    if (!res.ok) throw new Error('Movie not found');
                    data = await res.json();
                } else {
                    res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${getApiKey()}`);
                    data = await res.json();
                    if (!data || data.success === false) throw new Error('Movie not found');
                }
                data = normalizePosterPath(data);
                setMovie(data);
            } catch {
                setError('Filme não encontrado.');
            }
        };
        // Função para buscar os comentarios do TMDb
        const fetchReviews = async () => {
            if (!isNaN(Number(id))) {
                const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${getApiKey()}`
                );
                const data = await res.json();
                setReviews(data.results || []);
            } else {
                setReviews([]);
            }
        };

        // Função para buscar os comentários aprovados do servidor mongoDB
        const fetchApprovedComments = async () => {
            const res = await fetch(`http://localhost:5000/api/comments/approve/${id}`);
            const data = await res.json();
            setApprovedComments(data);
        };
        fetchMovie();
        fetchReviews();
        fetchApprovedComments();
    }, [id, genres]);

    // Mistura os comentários locais com os comentarios do TMDb
    const mergedComments = [
        ...approvedComments.map(c => ({
            id: c._id,
            user: c.user,
            date: c.createdAt?.slice(0, 10),
            text: c.text,
            source: 'user'
        })),
        ...reviews.slice(0, 10).map(r => ({
            id: r.id,
            user: r.author,
            date: r.created_at?.slice(0, 10),
            text: r.content,
            source: 'tmdb'
        }))
    ];

    // Função para submeter um comentário
    const submitComment = async (e) => {
        e.preventDefault();
        if (!user.trim() || !text.trim()) {
            setMessage('Introduzir nome e comentário.');
            return;
        }
        await fetch('http://localhost:5000/api/comments/pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId: id, user, text })
        });
        setText('');
        setMessage('Comentário submetido para aprovação.');
    };

    // Função para eliminar um comentário
    const deleteComment = async (commentId) => {
        if (!window.confirm('Tem a certeza que pretende eliminar este comentário?')) return;
        await fetch(`http://localhost:5000/api/comments/approve/${commentId}`, {
            method: 'DELETE'
        });
        const res = await fetch(`http://localhost:5000/api/comments/approve/${id}`);
        const data = await res.json();
        setApprovedComments(data);
    };

    return (
        <div className="App app-movie-details">
            <TopBar username={getName()} onLogout={() => navigate('/loginstreamer')} />
            <div className="bottom-bar">
                <div className="button-group">
                    <button
                        type="button"
                        className="app-recommended-btn"
                        onClick={() => navigate('/homepage')}
                        aria-label="Show recommended movies"
                    >
                        Ver Filmes Recomendados
                    </button>
                </div>
            </div>
            {/* Conteudo Principal */}
            <main className="center-content" role="main">
                {error ? (
                    <div className="loading-text" role="alert" aria-live="polite">{error}</div>
                ) : movie ? (
                    <div>
                        <div className="movie-details">
                            {movie.poster_path ? (
                                <img
                                    className="movie-poster"
                                    src={movie.poster_path}
                                    alt={movie.title}
                                />
                            ) : (
                                <div className="no-poster" aria-label="No image available">No Image</div>
                            )}
                            <div className="movie-info">
                                <h1 className="movie-title">{movie.title || 'Sem título'}</h1>
                                <p><strong>Data de Lançamento:</strong> {movie.release_date || 'Desconhecida'}</p>
                                <div className="movie-meta">
                                    <p className="movie-meta-item">
                                        <strong>Língua:</strong> {languageMap[movie.original_language] || movie.original_language || 'Desconhecida'}
                                    </p>
                                    <p className="movie-meta-item">
                                        <strong>Género:</strong> {getGenreNames(movie) || 'Desconhecido'}
                                    </p>
                                </div>
                                <p><strong>Sinopse:</strong> {movie.overview || 'Sem sinopse.'}</p>
                                <div className="movie-rating">
                                    <strong>Rating:</strong>
                                    <span className="star" aria-label={`Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} out of 10`}>
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i}>
                                                {movie.vote_average && movie.vote_average / 2 >= i + 1
                                                    ? '★'
                                                    : '☆'}
                                            </span>
                                        ))}
                                    </span>
                                    <span className="rating-value">
                                        ({movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} / 10)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Formulario do comentario */}
                        <form onSubmit={submitComment} className="comment-form" aria-label="Adicionar comentário">
                            <IconLetra name={user} />
                            <br />
                            <label htmlFor="comment-textarea" className="visually-hidden">
                                Adicionar comentário
                            </label>
                            <textarea
                                id="comment-textarea"
                                className="comment-form"
                                aria-label="Adicionar comentário"
                                placeholder="Adicionar comentário..."
                                value={text}
                                onChange={e => setText(e.target.value)}
                                rows={8}
                                cols={50}
                            />
                            <br />
                            <button className="submit-btn-comment">Comentar</button>
                            {message && <p role="alert" aria-live="polite">{message}</p>}
                        </form>

                        {/* Lista de comentários */}
                        <div className="user-reviews">
                            <h2>Comentários dos Utilizadores</h2>
                            {mergedComments.map(c => (
                                <div key={c.id} className="review-card">
                                    <div className="review-header" style={{ display: 'flex', alignItems: 'center' }}>
                                        <IconLetra name={c.user?.charAt(0) || ''} />
                                        <span className="review-author" style={{ marginLeft: '8px' }}>
                                             {c.user} {c.source === 'tmdb'}
                                        </span>
                                        <span className="review-date" style={{ marginLeft: '10px' }}>{c.date}</span>
                                        {c.source === 'user' && (
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteComment(c.id)}
                                                aria-label="Apagar Comentário"
                                            >
                                                Apagar Comentário
                                            </button>
                                        )}
                                    </div>
                                    <div className="review-content">{c.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="loading-text" role="status" aria-live="polite">A carregar...</div>
                )}
            </main>
            <Footer className="footer"/>
        </div>
    );
}

export default MovieDetails;