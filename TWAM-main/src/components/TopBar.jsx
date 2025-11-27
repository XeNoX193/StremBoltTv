import React from 'react';
import { FaPlayCircle } from 'react-icons/fa';
import IconLetra from './IconLetra.jsx';

// Componente TopBar que representa a barra superior da aplicação
export default function TopBar({ username, onLogout }) {
    return (
        <div className="top-bar" role="banner" aria-label="Main navigation bar">
            <h1 className="visually-hidden">StreamBolt TV Main Navigation</h1>
            <span className="name-topbar" aria-label="StreamBolt TV">
                <FaPlayCircle className="icon-play" aria-hidden="true" />
                StreamBolt TV
            </span>
            <div className="top-bar-spacer"></div>
            <IconLetra name={username} className="iconletter" />
            <span className="user-name">{username}</span>
            <button className="top-btn" onClick={onLogout}>
                Terminar Sessão
            </button>
        </div>
    );
}