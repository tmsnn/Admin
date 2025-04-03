import React from "react";
import "../styles/Table.css";

const Table = ({ data, columns }) => {
    return (
            <table className="main-table">
                <thead>
                <tr>
                    {columns.map((col, index) => (
                        <th key={index}>{col.label}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                            <td key={colIndex}>
                                {/* Если в колонке есть render, вызываем её, иначе выводим item[col.key] */}
                                {col.render ? col.render(item) : item[col.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
    );
};

export default Table;
