import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import "../styles/Settings.css";

const pageMap = {
    "privacy-security": "privacy_policy",
    "help-support": "help_support",
    "about-us": "about_us",
};

const SettingsPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [openSection, setOpenSection] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [editText, setEditText] = useState("");

    const [sections, setSections] = useState([
        {
            id: "privacy-security",
            title: "Privacy & Security",
            content: "",
        },
        {
            id: "help-support",
            title: "Help & Support",
            content: "",
        },
        {
            id: "faq",
            title: "FAQ",
            content: `Find answers to common questions here. (Пример: опишите вопросы и ответы.)`,
        },
        {
            id: "about-us",
            title: "About Us",
            content: "",
        },
    ]);

    // Загружаем контент с сервера для тех секций, у которых есть API
    useEffect(() => {
        Object.entries(pageMap).forEach(async ([id, title]) => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://0.0.0.0:8080/api/pages/${title}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSections((prev) =>
                        prev.map((section) =>
                            section.id === id ? { ...section, content: data.Content } : section
                        )
                    );
                } else {
                    console.error(`Ошибка при загрузке ${title}`);
                }
            } catch (err) {
                console.error(`Ошибка загрузки ${title}:`, err);
            }
        });
    }, []);

    const filteredSections = sections.filter((section) =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSection = (id) => {
        setOpenSection((prev) => (prev === id ? null : id));
    };

    const startEditing = (id) => {
        setEditingSection(id);
        const sec = sections.find((s) => s.id === id);
        setEditText(sec.content);
    };

    const saveEditing = async () => {
        const sectionId = editingSection;
        const titleForAPI = pageMap[sectionId];

        // Обновляем UI сразу
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === sectionId
                    ? { ...section, content: editText }
                    : section
            )
        );
        setEditingSection(null);

        // Если у этой секции есть API — отправим PUT
        if (titleForAPI) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://0.0.0.0:8080/api/pages/${titleForAPI}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: editText }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка обновления ${titleForAPI}`);
                }

                console.log("Page updated successfully");
            } catch (err) {
                console.error("Ошибка при сохранении:", err);
            }
        }
    };

    return (
        <div className="settings-page">
            <Sidebar />
            <div className="settings-content">
                <SearchBar onSearch={setSearchQuery} />
                <h1>Settings</h1>

                <div className="settings-sections">
                    {filteredSections.length > 0 ? (
                        filteredSections.map((section) => (
                            <div key={section.id} className="settings-section">
                                <div className="section-header">
                                    <h2>{section.title}</h2>
                                    <div className="section-icons">
                                        <button className="edit-btn" onClick={() => startEditing(section.id)}>✏️</button>
                                        <button className="toggle-btn" onClick={() => toggleSection(section.id)}>
                                            {openSection === section.id ? "↓" : "↑"}
                                        </button>
                                    </div>
                                </div>

                                {openSection === section.id && (
                                    <div className="section-content">
                                        {editingSection === section.id ? (
                                            <>
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    rows={8}
                                                />
                                                <div className="edit-buttons">
                                                    <button onClick={saveEditing}>Save</button>
                                                    <button onClick={() => setEditingSection(null)}>Cancel</button>
                                                </div>
                                            </>
                                        ) : section.id === "about-us" ? (
                                            <div>{section.content}</div>
                                        ) : (
                                            <pre>{section.content}</pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No results found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
