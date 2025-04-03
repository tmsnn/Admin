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
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(30);
    const [totalCount, setTotalCount] = useState(0);

    const maxPages = Math.max(1, Math.ceil(totalCount / pageSize));

    useEffect(() => {
        fetchUsers(1, 30);
    }, []);

    async function fetchUsers(p = 1, size = 30) {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: p,
                pageSize: size,
            });

            const response = await fetch(`http://0.0.0.0:8080/api/users?${params}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);

            const total = parseInt(response.headers.get("X-Total-Count"), 10);
            const data = await response.json();

            setUsers(data);
            setFilteredUsers(data);
            setTotalCount(total || data.length);
        } catch (error) {
            console.error("Ошибка при загрузке списка пользователей:", error);
        }
    }

    const handleLoadClick = () => {
        fetchUsers(page, pageSize);
    };

    const handlePrevPage = () => {
        const newPage = Math.max(1, page - 1);
        setPage(newPage);
        fetchUsers(newPage, pageSize);
    };

    const handleNextPage = () => {
        const newPage = Math.min(maxPages, page + 1);
        setPage(newPage);
        fetchUsers(newPage, pageSize);
    };

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
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error(`Ошибка загрузки пользователя: ${response.status}`);

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
            if (!response.ok) throw new Error(`Ошибка удаления: ${response.status}`);
            setIsDeleteOpen(false);
            fetchUsers(page, pageSize);
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
            if (!response.ok) throw new Error(`Ошибка обновления: ${response.status}`);
            setIsEditOpen(false);
            fetchUsers(page, pageSize);
        } catch (error) {
            console.error("Ошибка при сохранении пользователя:", error);
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
            date.getDate()
        ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
        ).padStart(2, "0")}`;
    }

    const columns = [
        { key: "id", label: "ID" },
        { key: "email", label: "Email" },
        { key: "first_name", label: "First Name" },
        { key: "last_name", label: "Last Name" },
        { key: "phone", label: "Phone" },
        {
            key: "created_at",
            label: "Created At",
            render: (user) => formatDate(user.created_at),
        },
        {
            key: "updated_at",
            label: "Updated At",
            render: (user) => formatDate(user.updated_at),
        },
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
                <button
                    onClick={() => {
                        setDeleteUserId(user.id);
                        setIsDeleteOpen(true);
                    }}
                >
                    🗑️
                </button>
            ),
        },
    ];

    return (
        <div className="users-page">
            <Sidebar />
            <div className="main-content">
                <SearchBar onSearch={handleSearch} />
                <div className="pagination-controls">
                    <label>
                        Page:
                        <input
                            type="number"
                            min={1}
                            value={page}
                            onChange={(e) => setPage(Number(e.target.value))}
                        />
                    </label>
                    <label>
                        Page Size:
                        <input
                            type="number"
                            min={1}
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        />
                    </label>
                    <button className="load-btn" onClick={handleLoadClick}>
                        Load
                    </button>
                </div>

                <div className="table-container">
                    <Table data={filteredUsers} columns={columns} />
                </div>

                <div className="pagination-buttons">
                    <button onClick={handlePrevPage} disabled={page <= 1}>
                        ⬅ Previous
                    </button>
                    <span className="page-info">Page {page}</span>
                    <button onClick={handleNextPage} disabled={page >= maxPages}>
                        Next ➡
                    </button>
                </div>

                {isEditOpen && editUser && (
                    <div className="edit-popup">
                        <div className="edit-popup-content">
                            <h3>Edit Profile</h3>
                            <form onSubmit={handleSaveEdit}>
                                <label>Email:</label>
                                <input
                                    type="text"
                                    value={editUser.email || ""}
                                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                />
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    value={editUser.first_name || ""}
                                    onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                                />
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    value={editUser.last_name || ""}
                                    onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                                />
                                <label>Phone:</label>
                                <input
                                    type="text"
                                    value={editUser.phone || ""}
                                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                                />
                                <div className="edit-popup-buttons">
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setIsEditOpen(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isDeleteOpen && (
                    <div className="popup">
                        <div className="popup-content">
                            <h3>Are you sure you want to delete this user?</h3>
                            <button onClick={handleDeleteUser}>Yes, delete</button>
                            <button onClick={() => setIsDeleteOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
