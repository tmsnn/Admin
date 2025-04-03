import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import "../styles/Tickets.css";

export default function TicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(30);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState("created_at");
    const [order, setOrder] = useState("asc");

    useEffect(() => {
        fetchTickets(page, pageSize, sortBy, order);
    }, []);

    async function fetchTickets(p = 1, size = 30, sort = sortBy, ord = order) {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: p,
                pageSize: size,
                sort_by: sort,
                order: ord,
            });

            const response = await fetch(`http://0.0.0.0:8080/api/tickets?${params}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            const total = parseInt(response.headers.get("X-Total-Count")) || 0;
            const data = await response.json();
            setTickets(data);
            setFilteredTickets(data);
            setTotalCount(total);
        } catch (error) {
            console.error("Ошибка при загрузке билетов:", error);
        }
    }

    function handleSearch(query) {
        if (!query) {
            setFilteredTickets(tickets);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = tickets.filter((ticket) =>
            Object.values(ticket).some((val) =>
                val?.toString().toLowerCase().includes(lowerQuery)
            )
        );
        setFilteredTickets(filtered);
    }

    const columns = [
        { key: "id", label: "ID" },
        { key: "order_number", label: "Order Number" },  // 👈 добавили поле
        { key: "created_at", label: "Created At" },
        { key: "price", label: "Price" },
        { key: "route_id", label: "Route ID" },
        { key: "status", label: "Status" },
        { key: "user_id", label: "User ID" },
    ];

    const maxPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="tickets-page">
            <Sidebar />
            <div className="tickets-content">
                <div className="search-wrapper">
                    <SearchBar onSearch={handleSearch} />
                </div>
                <div className="tickets-header">
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
                        <label>
                            Sort By:
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="created_at">Created At</option>
                                <option value="price">Price</option>
                                <option value="route">Route</option>
                                <option value="user">User</option>
                                <option value="start_date">Start Date</option>
                                <option value="status">Status</option>
                                <option value="order_number">Order Number</option> {/* 👈 если сортировка по нему возможна */}
                            </select>
                        </label>
                        <label>
                            Order:
                            <select value={order} onChange={(e) => setOrder(e.target.value)}>
                                <option value="asc">ASC</option>
                                <option value="desc">DESC</option>
                            </select>
                        </label>
                        <button
                            className="load-btn"
                            onClick={() => fetchTickets(page, pageSize, sortBy, order)}
                        >
                            Load
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <Table data={filteredTickets} columns={columns} />
                </div>

                <div className="pagination-buttons">
                    <button disabled={page <= 1} onClick={() => {
                        const newPage = page - 1;
                        setPage(newPage);
                        fetchTickets(newPage, pageSize, sortBy, order);
                    }}>
                        ⬅ Previous
                    </button>
                    <span className="page-info">Page {page}</span>
                    <button disabled={page >= maxPages} onClick={() => {
                        const newPage = page + 1;
                        setPage(newPage);
                        fetchTickets(newPage, pageSize, sortBy, order);
                    }}>
                        Next ➡
                    </button>
                </div>
            </div>
        </div>
    );
}
