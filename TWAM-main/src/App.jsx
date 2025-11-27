import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './streamer/HomePage.jsx';
import LoginStreamer from './streamer/LoginStreamer.jsx';
import MovieDetails from "./streamer/MovieDetails.jsx";
import LoginAdmin from "./admin/LoginAdmin.jsx";
import HomePageAdm from "./admin/HomePageAdm.jsx";
import AddMovie from "./admin/AddMovie.jsx";
import MovieDetailsAdm from "./admin/MovieDetailsAdm.jsx";

function App() {

    {/* Componente principal da aplicação, define as rotas da aplicação  */}

    return (
        <Router>
            <main id="main-content" tabIndex="-1">
                <Routes>
                    <Route path="/" element={<LoginStreamer />} />
                    <Route path="/loginstreamer" element={<LoginStreamer />} />
                    <Route path="/homepage/" element={<HomePage />} />
                    <Route path="/homepageadm" element={<HomePageAdm />} />
                    <Route path="/moviedetails/:id" element={<MovieDetails />} />
                    <Route path="/loginadmin" element={<LoginAdmin />} />
                    <Route path="/moviedetailsadm/:id" element={<MovieDetailsAdm />} />
                    <Route path="/addmovie" element={<AddMovie />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;