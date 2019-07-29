import React from "react";

const Broadcast = ({ x, y, size, data }) => {
    return (
        <text
            x={x}
            y={y}
            fontSize={`${size}pt`}
            textAnchor="middle"
            dominantBaseline="central"
        >
            💌
        </text>
    );
};

export default Broadcast;
