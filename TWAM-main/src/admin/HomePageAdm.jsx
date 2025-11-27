import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import '../App.css';
import { getApiKey, getName } from '../configs.js';
import TopBar from '../components/TopBar';
import IconLetra from '../components/IconLetra.jsx';
import BarraPesquisa from "../components/BarraPesquisa.jsx";
import Footer from "../components/Footer.jsx";
import { languageMap } from '../data.js';

function HomePageAdm() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState({});
    const [comments, setComments] = useState([]);
    const [movieTitles, setMovieTitles] = useState({});
    const [moviePosters, setMoviePosters] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedActions, setSelectedActions] = useState({});

    // Effect para obter os generos de filmes
    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${getApiKey()}&language=en-US`)
            .then(res => res.json())
            .then(data => {
                const genreObj = {};
                data.genres.forEach(g => { genreObj[g.id] = g.name; });
                setGenres(genreObj);
            });
    }, []);

    // Effect para buscar comentários pendentes ao carregar a página
    useEffect(() => {
        fetch('http://localhost:5000/api/comments/pending')
            .then(res => res.json())
            .then(async data => {
                setComments(data);
                setLoading(false);

                const uniqueIds = [...new Set(data.map(c => c.movieId))];
                const titles = {};
                const posters = {};
                const mongoIds = [];

                //Buscar títulos e posters dos filmes usando a API do TMDB
                await Promise.all(uniqueIds.map(async id => {
                    if (typeof id === 'string' && id.length === 24) {
                        mongoIds.push(id);
                        return;
                    }

                    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${getApiKey()}&language=en-US`);
                    if (res.ok) {
                        const movie = await res.json();
                        titles[id] = movie.title;
                        posters[id] = movie.poster_path
                            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                            : null;
                    } else {
                        titles[id] = 'Não foi possível obter o título do filme';
                        posters[id] = null;
                    }
                }));

                // Buscar títulos e posters dos filmes do MongoDB (locais
                if (mongoIds.length) {
                    await Promise.all(mongoIds.map(async id => {
                        const res = await fetch(`http://localhost:5000/api/movies/${id}`);
                        if (res.ok) {
                            const movie = await res.json();
                            titles[id] = movie.title;
                            posters[id] = movie.poster_path
                                ? (movie.poster_path.startsWith('/uploads/')
                                    ? `http://localhost:5000${movie.poster_path}`
                                    : `https://image.tmdb.org/t/p/w92${movie.poster_path}`)
                                : null;
                        } else {
                            titles[id] = 'Não foi possível obter o título do filme';
                            posters[id] = null;
                        }
                    }));
                }
                setMovieTitles(titles);
                setMoviePosters(posters);
            })
            .catch(() => setLoading(false));
    }, []);

    // Função para renderizar estrelas com base na avaliação
    function renderStars(vote) {
        const stars = Math.round(vote / 2);
        return (
            <span aria-label={`Rating: ${vote} out of 10`}>
                <span className="render-stars1">{'★'.repeat(stars)}</span>
                <span className="render-stars2">{'☆'.repeat(5 - stars)}</span>
            </span>
        );
    }

    // Função para lidar com aprovação e não aprovação de comentários
    const handleSelectChange = (commentId, value) => {
        setSelectedActions(prev => ({
            ...prev,
            [commentId]: value
        }));
    };

    // Função para submeter a ação selecionada (aprovar ou não aprovar)
    const handleSubmit = (commentId) => {
        const action = selectedActions[commentId];
        if (!action) return;
        if (action === 'aprovar') {
            if (!window.confirm('Tem a certeza que quer aprovar este comentário?')) return;
            fetch(`http://localhost:5000/api/comments/pending/${commentId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: true })
            })
                .then(res => res.json())
                .then(() => {
                    setComments(prev => prev.filter(c => c._id !== commentId));
                });
        } else if (action === 'naoaprovar') {
            if (!window.confirm('Tem a certeza que não quer aprovar este comentário?')) return;
            fetch(`http://localhost:5000/api/comments/notapproved/${commentId}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(() => {
                    setComments(prev => prev.filter(c => c._id !== commentId));
                });
        }
    };

    // Função para buscar filmes com base na consulta na Barra de Pesquisa
    const searchMovies = async () => {
        if (!query) return;
        let tmdbResults = [];
        let mongoResults = [];
        try {
            for (let page = 1; page <= 2; page++) {
                const res = await fetch(
                    `https://api.themoviedb.org/3/search/movie?api_key=${getApiKey()}&query=${encodeURIComponent(query)}&page=${page}`
                );
                const data = await res.json();
                if (Array.isArray(data.results)) {
                    tmdbResults = tmdbResults.concat(data.results);
                }
                if (tmdbResults.length >= 30 || page === data.total_pages) break;
            }
            const mongoRes = await fetch(
                `http://localhost:5000/api/movies/search?query=${encodeURIComponent(query)}`
            );
            mongoResults = await mongoRes.json();

            const mongoIds = new Set(mongoResults.map(m => String(m.id)));
            const merged = [
                ...mongoResults,
                ...tmdbResults.filter(m => !mongoIds.has(String(m.id)))
            ];
            setMovies(merged.slice(0, 30));
        } catch {
            setMovies([]);
        }
    };

    // Função para o botao de terminar sessão
    const handleLogout = () => {
        navigate('/loginadmin');
    };

    return (
        <div className="App app-bg">
            <TopBar username={getName()} onLogout={handleLogout} />
            <div className="bottom-bar">
                <div className="button-group">
                    <button type="button" onClick={() => navigate('/addmovie')}>
                        Adicionar Filme
                    </button>
                </div>
                <div>
                    <label htmlFor="search-bar-adm" className="visually-hidden">
                        Pesquisar filmes
                    </label>
                    <BarraPesquisa
                        query={query}
                        onChange={setQuery}
                        onSearch={searchMovies}
                        inputId="search-bar-adm"
                    />
                </div>
            </div>
            {/* Conteúdo Principal */}
            <main role="main">

                {/*Se houver uma consulta de pesquisa e filmes encontrados, exibe os resultados*/}
                {query && movies.length > 0 && (
                    <div>
                        <h2>Resultados da Pesquisa</h2>
                        <div className="movies-grid">
                            {movies.map(movie => (
                                <div
                                    key={movie._id || movie.id}
                                    className="movie-card"
                                    onClick={() => navigate(`/moviedetailsadm/${movie._id || movie.id}`)}
                                    style={{ cursor: 'pointer' }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Ver detalhes de ${movie.title}`}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            navigate(`/moviedetailsadm/${movie._id || movie.id}`);
                                        }
                                    }}
                                >
                                    {movie.poster_path ? (
                                        <img
                                            src={
                                                movie.poster_path.startsWith && movie.poster_path.startsWith('/uploads/')
                                                    ? `http://localhost:5000${movie.poster_path}`
                                                    : `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                                            }
                                            alt={movie.title}
                                        />
                                    ) : (
                                        <div className="no-poster" aria-label="No image available">No Image</div>
                                    )}
                                    <div className="movie-info">
                                        <h3>{movie.title}</h3>
                                        <div>
                                            <strong>Data de Lançamento:</strong> {movie.release_date}
                                        </div>
                                        <div>
                                            <strong>Língua:</strong> {languageMap[movie.original_language] || movie.original_language}
                                        </div>
                                        <div>
                                            <strong>Categoria:</strong> {Array.isArray(movie.genre_ids) ? movie.genre_ids.map(id => genres[id]).filter(Boolean).join(', ') : ''}
                                        </div>
                                        <div>
                                            <strong>Rating:</strong> {renderStars(movie.vote_average)} ({movie.vote_average}/10)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Se não houver consulta ou filmes encontrados, exibe a lista de comentários pendentes */}
                {(!query || movies.length === 0) && (
                    <>
                        <h1>Aprovação de Avaliações</h1>
                        <div>
                            {loading ? (
                                <div className="center-message-adm" role="status" aria-live="polite">A carregar comentários...</div>
                            ) : comments.length === 0 ? (
                                <p className="center-message-adm" role="alert" aria-live="polite">Sem comentários para aprovar.</p>
                            ) : (
                                <ul className="comments-list-adm">
                                    {comments.map(comment => (
                                        <li key={comment._id} className="comment-card-adm">
                                            <div className="comment-header-adm">
                                                <IconLetra name={comment.user} />
                                                <div>
                                                    <div className="user-name-adm">{comment.user}</div>
                                                    <div className="movie-title-adm">
                                                        {movieTitles[comment.movieId] || 'A carregar...'}
                                                    </div>
                                                </div>
                                                <img
                                                    src={moviePosters[comment.movieId] || 'https://via.placeholder.com/48x72?text=No+Image'}
                                                    alt="Poster-adm"
                                                    className="movie-poster-adm"
                                                />
                                            </div>
                                            <div className="comment-text-adm">
                                                {comment.text}
                                            </div>
                                            <div className="comment-actions-adm">
                                                <label htmlFor={`action-select-${comment._id}`} className="visually-hidden">
                                                    Selecionar ação para o comentário de {comment.user}
                                                </label>
                                                <select
                                                    id={`action-select-${comment._id}`}
                                                    value={selectedActions[comment._id] || ''}
                                                    onChange={e => handleSelectChange(comment._id, e.target.value)}
                                                    className="action-select-adm"
                                                    aria-label={`Selecionar ação para o comentário de ${comment.user}`}
                                                >
                                                    <option value="">Selecionar ação</option>
                                                    <option value="aprovar">Aprovar</option>
                                                    <option value="naoaprovar">Não Aprovar</option>
                                                </select>
                                                <button
                                                    onClick={() => handleSubmit(comment._id)}
                                                    className={
                                                        selectedActions[comment._id] === 'aprovar'
                                                            ? 'submit-btn-adm approve-adm'
                                                            : selectedActions[comment._id] === 'naoaprovar'
                                                                ? 'submit-btn-adm reject-adm'
                                                                : 'submit-btn-adm'
                                                    }
                                                    aria-label={`Submeter ação para o comentário de ${comment.user}`}
                                                >
                                                    Submeter
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </main>
            <Footer className="footer"/>
        </div>
    );
}

export default HomePageAdm;