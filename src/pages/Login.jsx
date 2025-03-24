import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://0.0.0.0:8080/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            // Если статус не 2xx
            if (!response.ok) {
                // Если 404 → говорим, что логин/пароль неверный
                if (response.status === 404) {
                    alert("Неправильный логин или пароль");
                    return;
                }
                // Иначе читаем сообщение из ответа или пишем статус
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка входа: ${response.status}`);
            }

            // Если всё ок, парсим JSON
            const data = await response.json();
            console.log("Успешный вход:", data);

            // Деструктурируем ответ
            const { access_token, admin } = data;

            // Проверяем наличие токена
            if (access_token) {
                localStorage.setItem("token", access_token);
                localStorage.setItem("isAuthenticated", "true");

                console.log("Пользователь:", admin);

                // Переход на страницу /users
                navigate("/users");
            } else {
                alert("Ошибка: отсутствует токен.");
            }
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            alert(error.message || "Ошибка входа");
        }
    };

    return (
        <div className="login-container">
            <h2 className="logo">AULWAY</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <label>Email</label>
                <input
                    type="email"
                    placeholder="admin@aulway.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">LogIn</button>
            </form>
        </div>
    );
}

export default Login;
