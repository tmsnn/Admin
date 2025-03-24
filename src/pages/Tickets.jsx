import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import "../styles/Tickets.css";

export default function TicketsPage({ userId }) {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [ticketDetails, setTicketDetails] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchTickets("upcoming");
    }, [userId]);

    async function fetchTickets(type) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://0.0.0.0:8080/api/tickets/users/${userId}?type=${type}`, {
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
            setTickets(data);
            setFilteredTickets(data);
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
            Object.values(ticket).some((val) => val?.toString().toLowerCase().includes(lowerQuery))
        );
        setFilteredTickets(filtered);
    }

    async function handleViewDetails(ticketId) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://0.0.0.0:8080/api/tickets/users/${userId}/${ticketId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Ошибка загрузки билета: ${response.status}`);
            }
            const ticketData = await response.json();
            setTicketDetails(ticketData);
            setIsDetailsOpen(true);
        } catch (error) {
            console.error("Ошибка при загрузке деталей билета:", error);
        }
    }

    const columns = [
        { key: "id", label: "ID" },
        { key: "created_at", label: "Created At" },
        { key: "payment_status", label: "Payment Status" },
        { key: "price", label: "Price" },
        { key: "status", label: "Status" },
        {
            key: "details",
            label: "Details",
            render: (ticket) => (
                <button onClick={() => handleViewDetails(ticket.id)}>🔍</button>
            ),
        },
    ];

    return (
        <div className="tickets-page">
            <Sidebar />
            <div className="tickets-content">
                <SearchBar onSearch={handleSearch} />
                <button onClick={() => fetchTickets("upcoming")}>Upcoming Tickets</button>
                <button onClick={() => fetchTickets("past")}>Past Tickets</button>
                <Table data={filteredTickets} columns={columns} />

                {isDetailsOpen && ticketDetails && (
                    <div className="details-popup">
                        <div className="details-popup-content">
                            <h3>Ticket Details</h3>
                            <p><strong>ID:</strong> {ticketDetails.id}</p>
                            <p><strong>Created At:</strong> {ticketDetails.created_at}</p>
                            <p><strong>Payment Status:</strong> {ticketDetails.payment_status}</p>
                            <p><strong>Price:</strong> {ticketDetails.price}</p>
                            <p><strong>QR Code:</strong> {ticketDetails.qr_code}</p>
                            <p><strong>Route ID:</strong> {ticketDetails.route_id}</p>
                            <p><strong>Status:</strong> {ticketDetails.status}</p>
                            <button onClick={() => setIsDetailsOpen(false)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
