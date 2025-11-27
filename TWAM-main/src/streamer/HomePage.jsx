import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../App.css';
import TopBar from '../components/TopBar';
import BarraPesquisa from "../components/BarraPesquisa.jsx";
import Footer from "../components/Footer.jsx";
import { getApiKey, getName } from '../configs.js';
import { languageMap } from "../data.js";


function HomePage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [recommendedPage] = useState(1);

    //Função para obter os nomes dos géneros a partir dos IDs
    function getGenreNames(genreIds, genres) {
        return genreIds
            .map(id => genres.find(g => g.id === id)?.name)
            .filter(Boolean)
            .join(', ');
    }

    //Função para renderizar estrelas com base na classificação
    function renderStars(vote) {
        const stars = Math.round(vote / 2); // 0-10 to 0-5
        return (
            <span aria-label={`Rating: ${vote} out of 10`}>
                <span style={{ color: '#FFD700' }}>{'★'.repeat(stars)}</span>
                <span style={{ color: '#ccc' }}>{'☆'.repeat(5 - stars)}</span>
            </span>
        );
    }

    //Função para normalizar o caminho do poster
    function normalizePosterPath(movie) {
        let poster_path = movie.poster_path;
        if (poster_path && poster_path.startsWith && poster_path.startsWith('/uploads/')) {
            poster_path = `http://localhost:5000${poster_path}`;
        } else if (poster_path && !poster_path.startsWith('http')) {
            poster_path = `https://image.tmdb.org/t/p/w200${poster_path}`;
        }
        return { ...movie, poster_path };
    }

    // Effect para buscar os géneros de filmes ao carregar a página
    useEffect(() => {
        const fetchGenres = async () => {
            const res = await fetch(
                `https://api.themoviedb.org/3/genre/movie/list?api_key=${getApiKey()}`
            );
            const data = await res.json();
            setGenres(data.genres || []);
        };
        fetchGenres();
    }, []);

    // Effect para buscar filmes recomendados ao carregar a página
    useEffect(() => {
        const fetchRecommended = async () => {
            const res1 = await fetch(
                `https://api.themoviedb.org/3/movie/popular?api_key=${getApiKey()}&page=${recommendedPage}`
            );
            const data1 = await res1.json();

            const res2 = await fetch(
                `https://api.themoviedb.org/3/movie/popular?api_key=${getApiKey()}&page=${recommendedPage + 1}`
            );
            const data2 = await res2.json();

            const combined = [...(data1.results || []), ...(data2.results || [])]
                .slice(0, 30)
                .map(normalizePosterPath);
            setRecommendedMovies(combined);
        };
        fetchRecommended();
    }, [recommendedPage]);

    // Função para buscar filmes com base na pesquisa na barra de pesquisa (TMDb e local
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

            const merged = [...mongoResults, ...tmdbResults]
                .slice(0, 30)
                .map(normalizePosterPath);
            setMovies(merged);
        } catch {
            setMovies([]);
        }
    };

    // Verifica se há uma consulta de pesquisa e se os filmes foram encontrados
    const displayMovies = query && Array.isArray(movies) && movies.length > 0 ? movies : recommendedMovies;

    // Função para o logout (botao de terminar sessao)
    const handleLogout = () => {
        navigate('/loginstreamer');
    };

    return (
        <div className="App">
            <TopBar username={getName()} onLogout={handleLogout} />
                <div className="bottom-bar">
                    <div className="button-group">
                    </div>
                    <div>
                        <label htmlFor="search-bar" className="visually-hidden">
                            Pesquisar filmes
                        </label>
                        <BarraPesquisa
                            query={query}
                            onChange={setQuery}
                            onSearch={searchMovies}
                            inputId="search-bar"
                        />
                    </div>
            </div>
            {/* Conteúdo Principal */}
            <main className="main-content" role="main">
                <h1>{query && movies.length > 0 ? 'Resultados da Pesquisa' : 'Filmes Recomendados'}</h1>
                <div className="movies-grid">
                    {displayMovies.length === 0 && <p>No movies found. Try searching!</p>}
                    {displayMovies.map(movie => (
                        <div
                            key={movie._id || movie.id}
                            className="movie-card"
                            onClick={() => navigate(`/moviedetails/${movie._id || movie.id}`)}
                            style={{ cursor: 'pointer' }}
                            tabIndex={0}
                            role="button"
                            aria-pressed="false"
                            aria-label={`Ver detalhes de ${movie.title}`}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    navigate(`/moviedetails/${movie._id || movie.id}`);
                                }
                            }}
                        >
                            {movie.poster_path ? (
                                <img
                                    src={movie.poster_path}
                                    alt={movie.title}
                                />
                            ) : (
                                <div className="no-poster" aria-label="No image available">No Image</div>
                            )}
                            <div className="movie-info">
                                <h2>{movie.title}</h2>
                                <p><strong>Data de Lançamento:</strong> {movie.release_date}</p>
                                <p>
                                    <strong>Língua:</strong> {languageMap[movie.original_language] || movie.original_language}
                                </p>
                                <p>
                                    <strong>Categoria:</strong> {getGenreNames(movie.genre_ids, genres)}
                                </p>
                                <div>
                                    <strong>Rating:</strong>{renderStars(movie.vote_average)} ({movie.vote_average}/10)
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer className="footer"/>
        </div>
    );
}

export default HomePage;