import React from 'react';


// Componente BarraPesquisa que renderiza uma barra de pesquisa para filmes
export default function BarraPesquisa({ query, onChange, onSearch, inputId = "search-bar" }) {
    return (
        <div className="search-container">
            <label htmlFor={inputId} className="visually-hidden">
                Pesquisar Filmes
            </label>
            <input
                id={inputId}
                type="text"
                placeholder="Pesquisar Filmes..."
                value={query}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSearch()}
                aria-label="Pesquisar Filmes"
            />
        </div>
    );
}