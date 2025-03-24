import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import "../styles/Users.css";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://0.0.0.0:8080/api/users?page=1&page_size=10", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error("Ошибка при загрузке списка пользователей:", error);
        }
    }

    function handleSearch(query) {
        if (!query) {
            setFilteredUsers(users);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = users.filter((user) =>
            Object.values(user).some((val) => val?.toString().toLowerCase().includes(lowerQuery))
        );
        setFilteredUsers(filtered);
    }

    async function handleEditClick(userId) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://0.0.0.0:8080/api/users/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Ошибка загрузки пользователя: ${response.status}`);
            }
            const userData = await response.json();
            setEditUser(userData);
            setIsEditOpen(true);
        } catch (error) {
            console.error("Ошибка при загрузке деталей пользователя:", error);
        }
    }

    async function handleDeleteUser() {
        if (!deleteUserId) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://0.0.0.0:8080/api/users/${deleteUserId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Ошибка удаления: ${response.status}`);
            }
            setIsDeleteOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Ошибка при удалении пользователя:", error);
        }
    }

    async function handleSaveEdit(e) {
        e.preventDefault();
        if (!editUser) return;

        const { id, email, first_name, last_name, phone } = editUser;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://0.0.0.0:8080/api/users/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email,
                    firstname: first_name,
                    lastname: last_name,
                    phone,
                }),
            });
            if (!response.ok) {
                throw new Error(`Ошибка обновления: ${response.status}`);
            }
            setIsEditOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Ошибка при сохранении пользователя:", error);
        }
    }

    const columns = [
        { key: "id", label: "ID" },
        { key: "email", label: "Email" },
        { key: "first_name", label: "First Name" },
        { key: "last_name", label: "Last Name" },
        { key: "phone", label: "Phone" },
        {
            key: "edit",
            label: "Edit",
            render: (user) => (
                <button onClick={() => handleEditClick(user.id)}>✏️</button>
            ),
        },
        {
            key: "delete",
            label: "Delete",
            render: (user) => (
                <button onClick={() => {
                    setDeleteUserId(user.id);
                    setIsDeleteOpen(true);
                }}>🗑️</button>
            ),
        },
    ];

    return (
        <div className="users-page">
            <Sidebar />
            <div className="users-content">
                <SearchBar onSearch={handleSearch} />
                <Table data={filteredUsers} columns={columns} />

                {isEditOpen && editUser && (
                    <div className="edit-popup">
                        <div className="edit-popup-content">
                            <h3>Edit Profile</h3>
                            <form onSubmit={handleSaveEdit}>
                                <label>Email:</label>
                                <input type="text" value={editUser.email || ""} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                                <label>First Name:</label>
                                <input type="text" value={editUser.first_name || ""} onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })} />
                                <label>Last Name:</label>
                                <input type="text" value={editUser.last_name || ""} onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })} />
                                <label>Phone:</label>
                                <input type="text" value={editUser.phone || ""} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} />
                                <div className="edit-popup-buttons">
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setIsEditOpen(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}