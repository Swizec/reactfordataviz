import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as d3 from "d3";
import useDimensions from "react-use-dimensions";

import Broadcast from "./Broadcast";

// const Svg = styled.svg`
//     height: 100vh;
//     width: 100vh;
// `;

function useDataset() {
    const [broadcasts, setBroadcasts] = useState([]);

    useEffect(() => {
        d3.json("data/broadcasts.json").then(data => {
            setBroadcasts(
                data
                    .map(d => ({ ...d, created_at: new Date(d.created_at) }))
                    .filter(d => d.recipients > 1000)
                    .filter(d => d.status === "completed")
                    .sort((a, b) => b.created_at - a.created_at)
            );
        });
    }, []);

    return { broadcasts };
}

function App() {
    const { broadcasts } = useDataset();
    const [ref, { width, height }] = useDimensions();

    if (broadcasts.length < 1) {
        return <p>Loading data ...</p>;
    }

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(broadcasts, d => d.created_at))
        .range([30, width - 30]);

    const sizeScale = d3
        .scaleLog()
        .domain(d3.extent(broadcasts, d => d.open_rate))
        .range([2, 25]);

    return (
        <svg ref={ref} width="100vw" height="100vh">
            {width &&
                height &&
                broadcasts.map(d => (
                    <Broadcast
                        key={d.id}
                        x={xScale(d.created_at)}
                        y={height / 2}
                        size={sizeScale(d.open_rate)}
                        data={d}
                    />
                ))}
        </svg>
    );
}

export default App;
