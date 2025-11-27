import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import '../App.css';
import { setApiKey, setName } from '../configs.js';
import { FaPlayCircle } from "react-icons/fa";
import Footer from "../components/Footer.jsx";

// Pagina de Login do Cinefilo
function LoginStreamer() {

    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Confirma se a chave api é valida enviando um pedido ao TMDb .
    // Se o pedido retornar o codigo 200, a chave é válida (true), caso contrário, é inválida (false).
    async function isApiKeyValid(apiKey) {
        const res = await fetch(`https://api.themoviedb.org/3/movie/550?api_key=${apiKey}`);
        return res.status === 200;
    }

    // Função que lida com o envio do formulário de login.
    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        const username = e.target.elements.username.value;
        const apiKey = e.target.elements.apiKey.value;
        setApiKey(apiKey);

        // Verifica se a chave API é válida
        const  valid = await isApiKeyValid(apiKey);
        if (!valid) {
            setError('ERRO: Chave API Inválida');
            return;
        }
        setName(username);
        navigate('/homepage');
    };

    return (
        <div className="App">
            <header className="top-bar" role="banner">
                <span className="name-topbar">
                    <FaPlayCircle className="icon-play" aria-hidden="true" />
                    <span>StreamBolt TV</span>
                </span>
            </header>
            {/* Conteudo Principal*/}
            <main className="login-bg" role="main">
                <form className="login-box" onSubmit={handleSubmit} aria-labelledby="login-title">
                    <h2 className="login-title" id="login-title">Login Cinéfilo</h2>
                    <label htmlFor="username-input" className="visually-hidden">Nome de Utilizador</label>
                    <input
                        className="login-input"
                        id="username-input"
                        type="text"
                        name="username"
                        placeholder="Nome de Utilizador"
                        required
                        autoComplete="username"
                    />
                    <label htmlFor="apikey-input" className="visually-hidden">Chave API (TMDb)</label>
                    <input
                        className="login-input"
                        id="apikey-input"
                        type="text"
                        name="apiKey"
                        placeholder="Chave API (TMDb)"
                        required
                        autoComplete="off"
                    />
                    <button className="login-btn" type="submit">
                        Login
                    </button>
                    {error && (
                        <div className="login-error" role="alert" aria-live="polite">
                            {error}
                        </div>
                    )}
                    <button
                        className="login-adm"
                        type="button"
                        onClick={() => navigate('/loginadmin')}
                    >
                        Iniciar Sessão como Administrador
                    </button>
                </form>
            </main>
            <Footer className="footer" />
        </div>
    );
}

export default LoginStreamer;