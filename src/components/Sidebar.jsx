import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Очистка данных пользователя (если хранятся в localStorage или context)
        localStorage.removeItem("userToken"); // пример, если используется токен
        navigate("/"); // Перенаправление на страницу авторизации
    };

    return (
        <div className="sidebar">
            <h2>AULWAY</h2>
            <ul>
                <li><Link to="/users">👤 Users</Link></li>
                <li><Link to="/roads">🚌 Roads</Link></li>
                <li><Link to="/tickets">📈 Tickets</Link></li>
                <li><Link to="/buses">🚌Buses</Link></li>
                <li><Link to="/settings">📈Settings</Link></li>
            </ul>
            <button className="logout-btn" onClick={handleLogout}>🚪 Log Out</button>
        </div>
    );
};

export default Sidebar;
