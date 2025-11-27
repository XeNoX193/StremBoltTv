import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

{/* Renderiza o componente principal da aplicação dentro do elemento com id 'root' */}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);