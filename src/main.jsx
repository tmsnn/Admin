import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users.jsx";
import Roads from "./pages/Roads.jsx";
import Tickets from "./pages/Tickets.jsx";
import Buses from "./pages/Buses.jsx";
import Settings from "./pages/Settings.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Users" element={<Users />} />
                <Route path="/roads" element={<Roads />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/buses" element={<Buses />} />;
                <Route path="/settings" element={<Settings />} />;
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
