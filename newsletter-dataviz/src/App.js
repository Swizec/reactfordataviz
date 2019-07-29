import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as d3 from "d3";
import useDimensions from "react-use-dimensions";

import Broadcast from "./Broadcast";

function useDataset() {
    const [broadcasts, setBroadcasts] = useState([]);
    const [responses, setResponses] = useState([]);

    useEffect(() => {
        (async function() {
            const broadcasts = await d3
                .json("data/broadcasts.json")
                .then(data =>
                    data
                        .map(d => ({
                            ...d,
                            created_at: new Date(d.created_at)
                        }))
                        .filter(d => d.recipients > 1000)
                        .filter(d => d.status === "completed")
                        .sort((a, b) => b.created_at - a.created_at)
                );

            setBroadcasts(broadcasts);

            let forms = await d3.json("data/forms.json");
            // associate forms with their respective email
            const date = d3.timeFormat("%x");
            const dateId = Object.fromEntries(
                broadcasts.map(d => [date(d.created_at), d.id])
            );

            forms = Object.fromEntries(
                forms.map(form => [
                    form.id,
                    dateId[date(new Date(form.last_updated_at))]
                ])
            );

            let responses = await d3.json("data/responses.json");
            responses = responses.map(row => ({
                ...row,
                broadcast_id: forms[row.form]
            }));

            setResponses(responses);
        })();
    }, []);

    return { broadcasts, responses };
}

function App() {
    const { broadcasts, responses } = useDataset();
    const [ref, { width, height }] = useDimensions();

    if (broadcasts.length < 1 || responses.length < 1) {
        return <p>Loading data ...</p>;
    }

    console.log(responses[0]);

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(broadcasts, d => d.created_at))
        .range([30, width - 30]);

    const sizeScale = d3
        .scaleLog()
        .domain(d3.extent(broadcasts, d => d.open_rate))
        .range([1, 25]);

    return (
        <svg ref={ref} width="99vw" height="99vh">
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
