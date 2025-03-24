import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Users from "./pages/Users";
import Roads from "./pages/Roads";
import Login from "./pages/Login";
import Tickets from "./pages/Tickets";
import Buses from "./pages/Buses";
import "./styles/App.css";
import Settings from "./pages/Settings.jsx";

const App = () => {
    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/roads" element={<Roads/>} />
                    <Route path="/tickets" element={<Tickets/>} />
                    <Route path="/buses" element={<Buses/>} />
                    <Route path="/settings" element={<Settings/>} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
