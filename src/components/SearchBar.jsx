import React, { useState } from "react";
import "../styles/SearchBar.css";

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState("");

    const handleSearch = (event) => {
        const value = event.target.value;
        setQuery(value);
        onSearch(value); // Передаём запрос в родительский компонент
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={handleSearch}
            />
            <button>🔍</button>
        </div>
    );
};

export default SearchBar;
