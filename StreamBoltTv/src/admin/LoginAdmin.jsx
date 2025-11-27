import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { setApiKey, setName } from '../configs.js';
import { FaPlayCircle } from "react-icons/fa";
import Footer from "../components/Footer.jsx";

function LoginAdmin() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Função que verifica se a chave API é válida enviando um pedido ao TMDb.
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

        // Verifica se a chave API é válida.
        const valid = await isApiKeyValid(apiKey);
        if (!valid) {
            setError('ERRO: Chave API Inválida');
            return;
        }
        setName(username);
        navigate('/homepageadm');
    };

    return (
        <div className="App">
            <div className="top-bar">
                <span className="name-topbar">
                    <FaPlayCircle className="icon-play" />
                    StreamBolt TV
                </span>
            </div>
            {/* Conteúdo Principal */}
            <main role="main">
                <div className="login-bg">
                    <form className="login-box" onSubmit={handleSubmit} aria-label="Login Administrador">
                        <h2 className="login-title">Login Administrador</h2>
                        <label htmlFor="username" className="visually-hidden">
                            Nome de Utilizador
                        </label>
                        <input
                            className="login-input"
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Nome de Utilizador"
                            required
                        />
                        <label htmlFor="apiKey" className="visually-hidden">
                            Chave API (TMDb)
                        </label>
                        <input
                            className="login-input"
                            type="text"
                            id="apiKey"
                            name="apiKey"
                            placeholder="Chave API (TMDb)"
                            required
                        />
                        <button className="login-btn" type="submit">
                            Login
                        </button>
                        {error && (
                            <div className="login-error" role="alert" aria-live="polite">
                                {error}
                            </div>
                        )}
                        <button className="login-adm" type="button" onClick={() => navigate('/loginstreamer')}>
                            Iniciar Sessão como Cinéfilo
                        </button>
                    </form>
                </div>
            </main>
            <Footer className="footer" />
        </div>
    );
}

export default LoginAdmin;