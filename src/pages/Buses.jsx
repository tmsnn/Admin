import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import "../styles/Buses.css";

export default function BusesPage() {
    const [buses, setBuses] = useState([]);
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [newBus, setNewBus] = useState({ number: "", total_seats: "" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(30);
    const [totalCount, setTotalCount] = useState(0);
    const [busIdToDelete, setBusIdToDelete] = useState(null);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);


    useEffect(() => {
        fetchBuses(page, pageSize);
    }, []);

    async function fetchBuses(customPage = 1, customPageSize = 30) {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: customPage,
                pageSize: customPageSize,
            });

            const response = await fetch(`http://0.0.0.0:8080/api/buses?${params}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Ошибка при получении автобусов");
            }

            const total = parseInt(response.headers.get("X-Total-Count"), 10);
            const data = await response.json();

            setTotalCount(total || data.length);
            setBuses(data);
            setFilteredBuses(data);
        } catch (error) {
            console.error("Ошибка при загрузке автобусов:", error);
        }
    }

    const maxPages = Math.ceil(totalCount / pageSize);

    function handleLoadClick() {
        const finalPage = Number(page) || 1;
        const finalSize = Number(pageSize) || 30;
        setPage(finalPage);
        setPageSize(finalSize);
        fetchBuses(finalPage, finalSize);
    }

    function handlePrevPage() {
        const newPage = Math.max(1, page - 1);
        setPage(newPage);
        fetchBuses(newPage, pageSize);
    }

    function handleNextPage() {
        const newPage = Math.min(maxPages, page + 1);
        setPage(newPage);
        fetchBuses(newPage, pageSize);
    }

    async function addNewBus() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://0.0.0.0:8080/api/buses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    number: newBus.number,
                    total_seats: parseInt(newBus.total_seats, 10),
                }),
            });

            if (!response.ok) throw new Error("Ошибка при добавлении автобуса");

            const created = await response.json();
            setBuses((prev) => [...prev, created]);
            setFilteredBuses((prev) => [...prev, created]);
            closeAddPopup();
        } catch (error) {
            console.error(error);
        }
    }

    function closeAddPopup() {
        setIsAddPopupOpen(false);
        setNewBus({ number: "", total_seats: "" });
    }

    function confirmDeleteBus(busId) {
        setBusIdToDelete(busId);
        setIsDeletePopupOpen(true);
    }

    async function handleDeleteBus() {
        if (!busIdToDelete) return;

        try {
            const token = localStorage.getItem("token");
            await fetch(`http://0.0.0.0:8080/api/buses/${busIdToDelete}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const updated = buses.filter((bus) => bus.id !== busIdToDelete);
            setBuses(updated);
            setFilteredBuses(updated);
            setIsDeletePopupOpen(false);
            setBusIdToDelete(null);
        } catch (error) {
            console.error("Ошибка при удалении автобуса:", error);
        }
    }


    async function handleSearch(query) {
        if (!query) {
            setFilteredBuses(buses);
            return;
        }

        const localFiltered = buses.filter((bus) =>
            Object.values(bus).some((val) =>
                val?.toString().toLowerCase().includes(query.toLowerCase())
            )
        );

        if (localFiltered.length > 0) {
            setFilteredBuses(localFiltered);
        } else {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://0.0.0.0:8080/api/buses/${query}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    setFilteredBuses([result]);
                } else {
                    setFilteredBuses([]);
                }
            } catch {
                setFilteredBuses([]);
            }
        }
    }

    const columns = [
        { key: "id", label: "ID" },
        { key: "number", label: "Number" },
        { key: "total_seats", label: "Total Seats" },
        {
            key: "delete",
            label: "Delete",
            render: (bus) => (
                <button
                    onClick={() => confirmDeleteBus(bus.id)}
                    className="icon-btn delete-btn"
                >
                    🗑️
                </button>
            ),
        }
    ];

    return (
        <div className="buses-page">
            <Sidebar />
            <div className="main-content">
                <div className="search-wrapper">
                    <SearchBar onSearch={handleSearch} />
                </div>

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

                <button className="add-bus-btn" onClick={() => setIsAddPopupOpen(true)}>
                    Add
                </button>

                <div className="table-container">
                    <Table data={filteredBuses} columns={columns} />
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
            </div>

            {isAddPopupOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Add New Bus</h2>
                        <input
                            type="text"
                            value={newBus.number}
                            onChange={(e) =>
                                setNewBus({ ...newBus, number: e.target.value })
                            }
                            placeholder="Bus Number"
                        />
                        <input
                            type="number"
                            value={newBus.total_seats}
                            onChange={(e) =>
                                setNewBus({ ...newBus, total_seats: e.target.value })
                            }
                            placeholder="Total Seats"
                        />
                        <button onClick={addNewBus}>Save</button>
                        <button onClick={closeAddPopup}>Cancel</button>
                    </div>
                </div>
            )}

            {isDeletePopupOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Are you sure you want to delete this bus?</h3>
                        <button onClick={handleDeleteBus}>Yes, delete</button>
                        <button onClick={() => setIsDeletePopupOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}

        </div>
    );
}
