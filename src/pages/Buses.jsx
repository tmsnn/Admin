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

    useEffect(() => {
        fetchBuses();
    }, []);

    async function fetchBuses() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://0.0.0.0:8080/api/buses", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка при получении автобусов: ${response.status}`);
            }

            const data = await response.json();
            const busesList = Array.isArray(data[0]) ? data[0] : [];

            const cleaned = busesList.map((bus) => ({
                id: bus.id,
                number: bus.number,
                total_seats: bus.total_seats,
            }));

            setBuses(cleaned);
            setFilteredBuses(cleaned);
        } catch (error) {
            console.error("Ошибка при загрузке автобусов:", error);
        }
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

            if (!response.ok) {
                throw new Error(`Ошибка добавления автобуса: ${response.status}`);
            }

            const created = await response.json();

            const updated = [...buses, created];
            setBuses(updated);
            setFilteredBuses(updated);

            closeAddPopup();
        } catch (error) {
            console.error("Ошибка при добавлении автобуса:", error);
        }
    }

    function handleSearch(query) {
        if (!query) {
            setFilteredBuses(buses);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = buses.filter((bus) =>
            Object.values(bus).some((val) =>
                val?.toString().toLowerCase().includes(lowerQuery)
            )
        );
        setFilteredBuses(filtered);
    }

    function openAddPopup() {
        setIsAddPopupOpen(true);
    }

    function closeAddPopup() {
        setIsAddPopupOpen(false);
        setNewBus({ number: "", total_seats: "" });
    }

    const columns = [
        { key: "id", label: "ID" },
        { key: "number", label: "Number" },
        { key: "total_seats", label: "Total Seats" },
    ];

    return (
        <div className="buses-page">
            <Sidebar />
            <div className="buses-content">
                <SearchBar onSearch={handleSearch} />

                <button className="add-bus-btn" onClick={openAddPopup}>
                    Add
                </button>

                <div className="table-container">
                    <Table data={filteredBuses} columns={columns} />
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
        </div>
    );
}
