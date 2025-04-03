import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import "../styles/Roads.css";

export default function RoadsPage() {
    const [roads, setRoads] = useState([]);
    const [filteredRoads, setFilteredRoads] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(30);
    const [totalCount, setTotalCount] = useState(0);
    const [editRoute, setEditRoute] = useState(null);
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [newRoute, setNewRoute] = useState({
        bus_id: "",
        departure: "",
        departure_location: "",
        destination: "",
        destination_location: "",
        start_date: "2025-12-12T13:00:00+05:00",
        end_date: "2025-12-12T18:00:00+05:00",
        price: "",
    });

    useEffect(() => {
        fetchRoutes(page, pageSize);
    }, []);

    const fetchRoutes = async (customPage = 1, customSize = 30) => {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({ page: customPage, pageSize: customSize });
            const response = await fetch(`http://0.0.0.0:8080/api/all-routes?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            const total = parseInt(response.headers.get("X-Total-Count"), 10);
            const rawData = await response.json();
            const mapped = rawData.map((r) => ({
                id: r.id,
                from: r.departure,
                to: r.destination,
                departure_location: r.departure_location || "",
                destination_location: r.destination_location || "",
                date: r.start_date?.split("T")[0] || "",
                time: r.start_date?.split("T")[1]?.slice(0, 5) || "",
                busId: r.bus_id,
                availableSeats: r.available_seats?.toString() || "0",
                price: r.price?.toString() || "0",
            }));

            setTotalCount(total || mapped.length);
            setRoads(mapped);
            setFilteredRoads(mapped);
        } catch (err) {
            console.error("Ошибка при загрузке маршрутов:", err);
        }
    };

    const handleSearch = async (query) => {
        if (!query) return setFilteredRoads(roads);

        const localFiltered = roads.filter((r) =>
            Object.values(r).some((val) =>
                val?.toString().toLowerCase().includes(query.toLowerCase())
            )
        );

        if (localFiltered.length > 0) return setFilteredRoads(localFiltered);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://0.0.0.0:8080/api/routes/${query}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const result = await res.json();
                setFilteredRoads([{
                    id: result.id,
                    from: result.departure,
                    to: result.destination,
                    departure_location: result.departure_location || "",
                    destination_location: result.destination_location || "",
                    date: result.start_date?.split("T")[0] || "",
                    time: result.start_date?.split("T")[1]?.slice(0, 5) || "",
                    busId: result.bus_id,
                    availableSeats: result.available_seats?.toString() || "0",
                    price: result.price?.toString() || "0",
                }]);
            } else {
                setFilteredRoads([]);
            }
        } catch {
            setFilteredRoads([]);
        }
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://0.0.0.0:8080/api/routes/${confirmDeleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const updated = roads.filter((r) => r.id !== confirmDeleteId);
                setRoads(updated);
                setFilteredRoads(updated);
                setConfirmDeleteId(null);
            }
        } catch (error) {
            console.error("Ошибка при удалении маршрута:", error);
        }
    };

    const handleCreateRoute = async () => {
        const {
            bus_id, departure, departure_location,
            destination, destination_location, start_date,
            end_date, price
        } = newRoute;

        if (!bus_id || !departure || !departure_location ||
            !destination || !destination_location || !start_date ||
            !end_date || !price
        ) {
            alert("Please fill in all fields before submitting.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://0.0.0.0:8080/api/routes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bus_id,
                    departure,
                    departure_location,
                    destination,
                    destination_location,
                    start_date,
                    end_date,
                    price: parseInt(price, 10),
                }),
            });

            if (!response.ok) throw new Error("Ошибка при создании маршрута");

            alert("Route created successfully.");
            setIsAddPopupOpen(false);
            setNewRoute({
                bus_id: "",
                departure: "",
                departure_location: "",
                destination: "",
                destination_location: "",
                start_date: "2025-12-12T13:00:00+05:00",
                end_date: "2025-12-12T18:00:00+05:00",
                price: "",
            });
            fetchRoutes(page, pageSize);
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleEdit = (route) => setEditRoute({ ...route });

    const handleUpdate = async () => {
        if (!editRoute) return;
        try {
            const token = localStorage.getItem("token");
            const body = {
                bus_id: editRoute.busId,
                departure: editRoute.from,
                departure_location: editRoute.departure_location,
                destination: editRoute.to,
                destination_location: editRoute.destination_location,
                price: parseInt(editRoute.price),
                start_date: `${editRoute.date}T${editRoute.time}`,
                end_date: `${editRoute.date}T${editRoute.time}`,
            };

            const res = await fetch(`http://0.0.0.0:8080/api/routes/${editRoute.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert("Route updated successfully.");
                setEditRoute(null);
                fetchRoutes(page, pageSize);
            } else {
                throw new Error(`Ошибка обновления: ${res.status}`);
            }
        } catch (e) {
            console.error("Ошибка при обновлении маршрута:", e);
        }
    };

    const maxPages = Math.ceil(totalCount / pageSize);

    const columns = [
        { key: "id", label: "ID" },
        { key: "from", label: "From" },
        { key: "to", label: "To" },
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "busId", label: "Bus ID" },
        { key: "availableSeats", label: "Seats" },
        { key: "price", label: "Price" },
        {
            key: "edit",
            label: "Edit",
            render: (road) => (
                <button className="icon-btn edit-btn" onClick={() => handleEdit(road)}>✏️</button>
            ),
        },
        {
            key: "delete",
            label: "Delete",
            render: (road) => (
                <button className="icon-btn delete-btn" onClick={() => setConfirmDeleteId(road.id)}>🗑️</button>
            ),
        },
    ];

    return (
        <div className="roads-page">
            <Sidebar />
            <div className="roads-content">
                <SearchBar onSearch={handleSearch} />

                <div className="pagination-controls">
                    <label>Page:
                        <input type="number" value={page} onChange={(e) => setPage(Number(e.target.value))} />
                    </label>
                    <label>Page Size:
                        <input type="number" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} />
                    </label>
                    <button className="load-btn" onClick={() => fetchRoutes(page, pageSize)}>Load</button>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="add-btn" onClick={() => setIsAddPopupOpen(true)}>Add</button>
                </div>

                <div className="table-container">
                    <Table data={filteredRoads} columns={columns} />
                </div>

                <div className="pagination-buttons">
                    <button onClick={() => { const newPage = Math.max(1, page - 1); setPage(newPage); fetchRoutes(newPage, pageSize); }} disabled={page <= 1}>⬅ Prev</button>
                    <span className="page-info">Page {page}</span>
                    <button onClick={() => { const newPage = Math.min(maxPages, page + 1); setPage(newPage); fetchRoutes(newPage, pageSize); }} disabled={page >= maxPages}>Next ➡</button>
                </div>

                {editRoute && (
                    <div className="popup">
                        <div className="popup-content">
                            <h2>Edit Route</h2>
                            <input value={editRoute.from} onChange={(e) => setEditRoute({ ...editRoute, from: e.target.value })} placeholder="From" />
                            <input value={editRoute.departure_location} onChange={(e) => setEditRoute({ ...editRoute, departure_location: e.target.value })} placeholder="Departure Location" />
                            <input value={editRoute.to} onChange={(e) => setEditRoute({ ...editRoute, to: e.target.value })} placeholder="To" />
                            <input value={editRoute.destination_location} onChange={(e) => setEditRoute({ ...editRoute, destination_location: e.target.value })} placeholder="Destination Location" />
                            <input value={editRoute.busId} onChange={(e) => setEditRoute({ ...editRoute, busId: e.target.value })} placeholder="Bus ID" />
                            <input value={editRoute.date} onChange={(e) => setEditRoute({ ...editRoute, date: e.target.value })} placeholder="Date" />
                            <input value={editRoute.time} onChange={(e) => setEditRoute({ ...editRoute, time: e.target.value })} placeholder="Time" />
                            <input value={editRoute.price} onChange={(e) => setEditRoute({ ...editRoute, price: e.target.value })} placeholder="Price" />
                            <button onClick={handleUpdate}>Save</button>
                            <button onClick={() => setEditRoute(null)}>Cancel</button>
                        </div>
                    </div>
                )}

                {isAddPopupOpen && (
                    <div className="popup">
                        <div className="popup-content">
                            <h2>Add New Route</h2>
                            <input placeholder="From" value={newRoute.departure} onChange={(e) => setNewRoute({ ...newRoute, departure: e.target.value })} />
                            <input placeholder="Departure Location" value={newRoute.departure_location} onChange={(e) => setNewRoute({ ...newRoute, departure_location: e.target.value })} />
                            <input placeholder="To" value={newRoute.destination} onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })} />
                            <input placeholder="Destination Location" value={newRoute.destination_location} onChange={(e) => setNewRoute({ ...newRoute, destination_location: e.target.value })} />
                            <input placeholder="Bus ID" value={newRoute.bus_id} onChange={(e) => setNewRoute({ ...newRoute, bus_id: e.target.value })} />
                            <input placeholder="Start Date" value={newRoute.start_date} onChange={(e) => setNewRoute({ ...newRoute, start_date: e.target.value })} />
                            <input placeholder="End Date" value={newRoute.end_date} onChange={(e) => setNewRoute({ ...newRoute, end_date: e.target.value })} />
                            <input placeholder="Price" type="number" value={newRoute.price} onChange={(e) => setNewRoute({ ...newRoute, price: e.target.value })} />
                            <button onClick={handleCreateRoute}>Create</button>
                            <button onClick={() => setIsAddPopupOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {confirmDeleteId && (
                    <div className="popup">
                        <div className="popup-content">
                            <h3>Are you sure you want to delete this route?</h3>
                            <button onClick={handleDelete}>Yes, delete</button>
                            <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
