import React from 'react';

// Componente IconLetra que exibe as iniciais de um nome dentro do avatar
function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
}

// Componente IconLetra que renderiza o avatar
export default function IconLetra({ name, className = '' }) {
    return (
        <div
            className={`avatar-adm ${className}`}
            aria-label={name}
            role="img"
        >
            {getInitials(name)}
            <span className="visually-hidden">{name}</span>
        </div>
    );
}