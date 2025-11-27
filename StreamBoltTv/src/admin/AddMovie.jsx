import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import TopBar from '../components/TopBar';
import { getName, getApiKey } from "../configs.js";
import Footer from "../components/Footer.jsx";

function AddMovie() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        poster_path: null,
        release_date: '',
        original_language: '',
        genre_ids: [],
        vote_average: '',
        overview: ''
    });
    const [message, setMessage] = useState('');
    const [genres, setGenres] = useState([]);
    const fileInputRef = useRef();

    // Effect para buscar os géneros de filmes ao carregar a página
    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${getApiKey()}&language=en-US`)
            .then(res => res.json())
            .then(data => setGenres(data.genres || []))
            .catch(() => setGenres([]));
    }, []);

    // Função para os campos do formulário (se é ficheiro, texto, data etc)
    const handleChange = e => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setForm(prev => ({ ...prev, [name]: files[0] }));
        } else if (name === 'genre_ids') {
            const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
            setForm(prev => ({ ...prev, genre_ids: selected }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // Função para enviar os dados de formulário para o servidor
    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('poster_path', form.poster_path);
            formData.append('release_date', form.release_date);
            formData.append('original_language', form.original_language);
            formData.append('vote_average', parseFloat(form.vote_average));
            formData.append('genre_ids', JSON.stringify(form.genre_ids));
            formData.append('overview', form.overview);

            const res = await fetch('http://localhost:5000/api/movies', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setMessage('Filme Adicionado com Sucesso!');
                setForm({
                    title: '',
                    poster_path: null,
                    release_date: '',
                    original_language: '',
                    genre_ids: [],
                    vote_average: '',
                    overview: ''
                });
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                const data = await res.json();
                setMessage(data.error || 'Erro ao Adicionar Filme.');
            }
        } catch {
            setMessage('Erro de servidor.');
        }
    };

    // Função para o botao de terminar sessão
    const handleLogout = () => {
        navigate('/loginadmin');
    };

    return (
        <div className="App">
            <TopBar username={getName()} onLogout={handleLogout} />
            <div className="bottom-bar">
                <div className="button-group">
                    <button
                        type="button"
                        onClick={() => navigate('/homepageadm')}
                        aria-label="Ir para Aprovações de Avaliações"
                    >
                        Aprovações de Avaliações
                    </button>
                </div>
            </div>
            <h1>Adicionar Filme</h1>
            <main role="main">
                <div className="center-content-adm">
                    <form className="add-movie-form" onSubmit={handleSubmit} aria-label="Adicionar Filme">
                        <div>
                            <label htmlFor="title" className="visually-hidden">Título do filme</label>
                            <input
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="Título do filme"
                            />
                        </div>
                        <div>
                            <label htmlFor="poster_path" className="visually-hidden">Poster</label>
                            <input
                                id="poster_path"
                                name="poster_path"
                                type="file"
                                accept="image/png"
                                onChange={handleChange}
                                required
                                ref={fileInputRef}
                            />
                        </div>
                        <div>
                            <label htmlFor="release_date" className="visually-hidden">Data de Lançamento</label>
                            <input
                                id="release_date"
                                className="date-input"
                                name="release_date"
                                type="date"
                                value={form.release_date}
                                onChange={handleChange}
                                required
                                placeholder="Data de Lançamento"
                            />
                        </div>
                        <div>
                            <label htmlFor="original_language" className="visually-hidden">Idioma Original</label>
                            <input
                                id="original_language"
                                name="original_language"
                                value={form.original_language}
                                onChange={handleChange}
                                required
                                placeholder="Idioma Original"
                            />
                        </div>
                        <div>
                            <label htmlFor="genre_ids" className="visually-hidden">Géneros</label>
                            <select
                                id="genre_ids"
                                className="genre-input"
                                name="genre_ids"
                                value={form.genre_ids.length ? form.genre_ids.map(String) : ['']}
                                onChange={handleChange}
                                required
                                aria-label="Selecionar Género"
                            >
                                <option value="" disabled>Seleccionar Género</option>
                                {genres.map(genre => (
                                    <option key={genre.id} value={genre.id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="vote_average" className="visually-hidden">Rating</label>
                            <input
                                id="vote_average"
                                className="rating-input"
                                name="vote_average"
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={form.vote_average}
                                onChange={handleChange}
                                required
                                placeholder="Rating"
                            />
                        </div>
                        <div>
                            <label htmlFor="overview" className="visually-hidden">Sinopse</label>
                            <textarea
                                id="overview"
                                name="overview"
                                value={form.overview}
                                onChange={handleChange}
                                required
                                rows={4}
                                cols={50}
                                placeholder="Sinopse"
                            />
                        </div>
                        <button type="submit" aria-label="Adicionar Filme">Adicionar</button>
                        {message && (
                            <div className="form-message" role="alert" aria-live="polite">
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </main>
            <Footer className="footer" />
        </div>
    );
}

export default AddMovie;