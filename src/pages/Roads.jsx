import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import "../styles/Roads.css";

export default function RoadsPage() {
    // Локальный список маршрутов
    const [roads, setRoads] = useState([]);
    const [filteredRoads, setFilteredRoads] = useState([]);

    // Поля для поиска (на сервере)
    const [searchDeparture, setSearchDeparture] = useState("");
    const [searchDestination, setSearchDestination] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [searchPassengers, setSearchPassengers] = useState("");

    // Попапы (однократно объявляем все 3)
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

    // Текущий маршрут (для редактирования / удаления)
    const [currentRoad, setCurrentRoad] = useState(null);
    const [roadToDelete, setRoadToDelete] = useState(null);

    // Поля для создания нового маршрута
    const [newRoad, setNewRoad] = useState({
        bus_id: "",
        departure: "",
        destination: "",
        start_date: "2025-12-12T13:00:00+05:00",
        end_date: "2025-12-12T13:00:00+05:00",
        price: 0,
    });

    // ================================
    // 1) Загрузка списка (GET /api/routes) - убираем пустые query
    // ================================
    useEffect(() => {
        fetchRoutes();
    }, []);

    async function fetchRoutes() {
        try {
            const token = localStorage.getItem("token");

            // Не добавляем пустые query
            const params = new URLSearchParams();
            if (searchDeparture.trim()) params.set("departure", searchDeparture.trim());
            if (searchDestination.trim()) params.set("destination", searchDestination.trim());
            if (searchDate.trim()) params.set("date", searchDate.trim());
            if (searchPassengers.trim()) {
                params.set("passengers", searchPassengers.trim());
            } else {
                params.set("passengers", "1");
            }
            params.set("page", "1");
            params.set("pageSize", "30");

            const response = await fetch(`http://0.0.0.0:8080/api/routes?${params}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Ошибка загрузки маршрутов: ${response.status}`);
            }

            const data = await response.json();
            console.log("маршруты:", data);

            // Если приходит двумерный массив
            const flat = data.flat();
            console.log("Преобразовано в одномер:", flat);

            // Мапим в локальный формат
            const mapped = flat.map((r) => ({
                id: r.id,
                from: r.departure,
                to: r.destination,
                date: r.start_date?.split("T")[0] || "",
                time: r.start_date?.split("T")[1]?.slice(0,5) || "",
                busId: r.bus_id,
                availableSeats: r.available_seats?.toString() || "0",
                price: r.price?.toString() || "0",
            }));

            setRoads(mapped);
            setFilteredRoads(mapped);
        } catch (error) {
            console.error("Ошибка при загрузке маршрутов:", error);
        }
    }

    // ================================
    // 2) Поиск (локальный) по таблице
    // ================================
    function handleSearch(query) {
        if (!query) {
            setFilteredRoads(roads);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = roads.filter((road) =>
            Object.values(road).some((val) => val?.toString().toLowerCase().includes(lowerQuery))
        );
        setFilteredRoads(filtered);
    }

    // Кнопка "Search" для перезапроса на сервер
    function handleFetchRoutesClick() {
        fetchRoutes();
    }

    // ================================
    // 3) Добавление (POST /api/routes)
    // ================================
    function openAddPopup() {
        setIsAddPopupOpen(true);
    }
    function closeAddPopup() {
        setIsAddPopupOpen(false);
        setNewRoad({
            bus_id: "",
            departure: "",
            destination: "",
            start_date: "2025-12-12T13:00:00+05:00",
            end_date: "2025-12-12T13:00:00+05:00",
            price: 0,
        });
    }

    async function addRoute() {
        try {
            // Проверяем, чтобы поля не были пустыми
            if (!newRoad.bus_id || !newRoad.departure || !newRoad.destination ||
                !newRoad.start_date || !newRoad.end_date) {
                alert("Please fill all required fields (bus_id, departure, destination, start_date, end_date)!");
                return;
            }

            const token = localStorage.getItem("token");
            const response = await fetch("http://0.0.0.0:8080/api/routes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bus_id: newRoad.bus_id,
                    departure: newRoad.departure,
                    destination: newRoad.destination,
                    start_date: newRoad.start_date,
                    end_date: newRoad.end_date,
                    price: parseInt(newRoad.price, 10),
                }),
            });
            if (!response.ok) {
                throw new Error(`Ошибка создания маршрута: ${response.status}`);
            }
            const created = await response.json();
            console.log("Создан маршрут:", created);

            // Мапим к локальному виду
            const mapped = {
                id: created.id,
                from: created.departure,
                to: created.destination,
                date: created.start_date?.split("T")[0] || "",
                time: created.start_date?.split("T")[1]?.slice(0,5) || "",
                busId: created.bus_id,
                availableSeats: created.available_seats?.toString() || "0",
                price: created.price?.toString() || "0",
            };
            const updated = [...roads, mapped];
            setRoads(updated);
            setFilteredRoads(updated);

            closeAddPopup();
        } catch (error) {
            console.error("Ошибка при создании маршрута:", error);
        }
    }

    // ================================
    // 4) Редактирование (POST /api/routes/{id})
    // ================================
    function openEditPopup(road) {
        setCurrentRoad({ ...road });
        setIsEditPopupOpen(true);
    }
    function closeEditPopup() {
        setIsEditPopupOpen(false);
        setCurrentRoad(null);
    }

    async function saveChanges() {
        try {
            if (!currentRoad) return;
            const token = localStorage.getItem("token");

            // Проверяем, чтобы поля не были пустыми
            if (!currentRoad.from || !currentRoad.to || !currentRoad.date || !currentRoad.time || !currentRoad.busId) {
                alert("Please fill all required fields in Edit popup!");
                return;
            }

            const response = await fetch(`http://0.0.0.0:8080/api/routes/${currentRoad.id}`, {
                method: "POST", // сервер так сказал
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bus_id: currentRoad.busId,
                    departure: currentRoad.from,
                    destination: currentRoad.to,
                    start_date: currentRoad.date + "T" + currentRoad.time,
                    end_date: currentRoad.date + "T" + currentRoad.time,
                    price: parseInt(currentRoad.price, 10),
                }),
            });
            if (!response.ok) {
                throw new Error(`Ошибка обновления маршрута: ${response.status}`);
            }
            const text = await response.text(); // "Route updated successfully"
            console.log("Ответ на обновление маршрута:", text);

            // Локально обновим
            const updatedRoads = roads.map((r) => (r.id === currentRoad.id ? currentRoad : r));
            setRoads(updatedRoads);
            setFilteredRoads(updatedRoads);

            closeEditPopup();
        } catch (error) {
            console.error("Ошибка при сохранении маршрута:", error);
        }
    }

    // ================================
    // 5) Удаление (DELETE /api/routes/{id})
    // ================================
    function openDeletePopup(road) {
        setRoadToDelete(road);
        setIsDeletePopupOpen(true);
    }
    function closeDeletePopup() {
        setIsDeletePopupOpen(false);
        setRoadToDelete(null);
    }

    async function confirmDelete() {
        if (!roadToDelete) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://0.0.0.0:8080/api/routes/${roadToDelete.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Ошибка удаления маршрута: ${response.status}`);
            }
            const text = await response.text(); // "Success"
            console.log("Удаление маршрута:", text);

            const updated = roads.filter((r) => r.id !== roadToDelete.id);
            setRoads(updated);
            setFilteredRoads(updated);

            closeDeletePopup();
        } catch (error) {
            console.error("Ошибка при удалении маршрута:", error);
        }
    }

    // ================================
    // Колонки таблицы
    // ================================
    const columns = [
        { key: "id", label: "ID" },
        { key: "from", label: "From" },
        { key: "to", label: "To" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "busId", label: "Bus ID" },
        { key: "availableSeats", label: "Available Seats" },
        { key: "price", label: "Price" },
    ];

    return (
        <div className="roads-page">
            <Sidebar />
            <div className="roads-content">
                {/* Поля для server-side поиска */}
                <div style={{ marginBottom:"10px" , marginTop: "100px", marginLeft: "350px"}}>
                    <label style={{color: "white"}}>Departure:</label>
                    <input
                        type="text"
                        value={searchDeparture}
                        onChange={(e) => setSearchDeparture(e.target.value)}
                        placeholder="Almaty"
                    />
                    <label style={{color: "white"}}>Destination:</label>
                    <input
                        type="text"
                        value={searchDestination}
                        onChange={(e) => setSearchDestination(e.target.value)}
                        placeholder="Uzynagash"
                    />
                    <label style={{color: "white"}}>Date (YYYY-MM-DD):</label>
                    <input
                        type="text"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        placeholder="2025-12-12"
                    />
                    <label style={{color: "white"}}>Passengers:</label>
                    <input
                        type="number"
                        value={searchPassengers}
                        onChange={(e) => setSearchPassengers(e.target.value)}
                        placeholder="1"
                    />
                    <button onClick={handleFetchRoutesClick}>Search</button>
                </div>

                {/* Локальный поиск */}
                <SearchBar onSearch={handleSearch} />

                {/* Кнопка Add */}
                <button className="add-route-btn" onClick={() => setIsAddPopupOpen(true)}>
                    Add
                </button>

                <Table
                    data={filteredRoads}
                    columns={columns}
                    onEdit={openEditPopup}
                    onDelete={openDeletePopup}
                />
            </div>

            {/* Попап Add */}
            {isAddPopupOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Create Route</h2>
                        <input
                            type="text"
                            placeholder="Bus ID"
                            value={newRoad.bus_id}
                            onChange={(e) => setNewRoad({ ...newRoad, bus_id: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Departure"
                            value={newRoad.departure}
                            onChange={(e) => setNewRoad({ ...newRoad, departure: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Destination"
                            value={newRoad.destination}
                            onChange={(e) => setNewRoad({ ...newRoad, destination: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Start Date"
                            value={newRoad.start_date}
                            onChange={(e) => setNewRoad({ ...newRoad, start_date: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="End Date"
                            value={newRoad.end_date}
                            onChange={(e) => setNewRoad({ ...newRoad, end_date: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={newRoad.price}
                            onChange={(e) => setNewRoad({ ...newRoad, price: e.target.value })}
                        />

                        <button onClick={addRoute}>Save</button>
                        <button onClick={closeAddPopup}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Попап Edit */}
            {isEditPopupOpen && currentRoad && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Edit Route</h2>
                        <input
                            type="text"
                            value={currentRoad.from}
                            onChange={(e) => setCurrentRoad({ ...currentRoad, from: e.target.value })}
                            placeholder="From"
                        />
                        <input
                            type="text"
                            value={currentRoad.to}
                            onChange={(e) => setCurrentRoad({ ...currentRoad, to: e.target.value })}
                            placeholder="To"
                        />
                        <input
                            type="text"
                            value={currentRoad.date}
                            onChange={(e) => setCurrentRoad({ ...currentRoad, date: e.target.value })}
                            placeholder="Date"
                        />
                        <input
                            type="text"
                            value={currentRoad.time}
                            onChange={(e) => setCurrentRoad({ ...currentRoad, time: e.target.value })}
                            placeholder="Time"
                        />
                        <input
                            type="text"
                            value={currentRoad.busId}
                            onChange={(e) => setCurrentRoad({ ...currentRoad, busId: e.target.value })}
                            placeholder="Bus ID"
                        />
                        <input
                            type="text"
                            value={currentRoad.availableSeats}
                            onChange={(e) => setCurrentRoad({ ...currentRoad, availableSeats: e.target.value })}
                            placeholder="Available Seats"
                        />
                        <input
                            type="text"
                            value={currentRoad.price}
                            onChange={(e) => setCurrentRoad({ ...currentRoad, price: e.target.value })}
                            placeholder="Price"
                        />

                        <button onClick={saveChanges}>Save</button>
                        <button onClick={closeEditPopup}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Попап Delete */}
            {isDeletePopupOpen && roadToDelete && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Are you sure you want to delete this route?</h2>
                        <button onClick={confirmDelete}>Yes</button>
                        <button onClick={closeDeletePopup}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
