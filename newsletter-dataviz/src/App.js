import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import useDimensions from "react-use-dimensions";

import Broadcast from "./Broadcast";
import MetaData from "./MetaData";

const dateFormat = d3.timeFormat("%x");

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
                        .sort((a, b) => a.created_at - b.created_at)
                );

            let forms = await d3.json("data/forms.json");
            // associate forms with their respective email

            const dateId = Object.fromEntries(
                broadcasts.map(d => [dateFormat(d.created_at), d.id])
            );

            forms = Object.fromEntries(
                forms.map(form => [
                    form.id,
                    dateId[dateFormat(new Date(form.last_updated_at))]
                ])
            );

            let responses = await d3.json("data/responses.json");
            responses = responses
                .map(row => ({
                    ...row,
                    broadcast_id: forms[row.form]
                }))
                .filter(d => d.broadcast_id !== undefined);

            setBroadcasts(
                broadcasts.map(d => ({
                    ...d,
                    responses: responses.find(r => r.broadcast_id === d.id)
                }))
            );
        })();
    }, []);

    return { broadcasts, responses };
}

function useRevealAnimation({ duration, broadcasts, responses }) {
    const [N, setN] = useState(0);

    useEffect(() => {
        if (broadcasts.length > 1) {
            d3.selection()
                .transition("data-reveal")
                .duration(duration * 1000)
                .tween("Nvisible", () => {
                    const interpolate = d3.interpolate(0, broadcasts.length);
                    return t => setN(Math.round(interpolate(t)));
                });
        }
    }, [broadcasts.length]);

    return N;
}

function App() {
    const { broadcasts } = useDataset();
    const [ref, { width, height }] = useDimensions();
    const [currentBroadcast, setCurrentBroadcast] = useState(null);
    const N = useRevealAnimation({ broadcasts, duration: 10 });

    if (broadcasts.length < 1) {
        return <p>Loading data ...</p>;
    }

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(broadcasts, d => d.created_at))
        .range([30, width - 30]);

    const sizeScale = d3
        .scaleLinear()
        .domain(d3.extent(broadcasts, d => d.open_rate))
        .range([2, 25]);

    return (
        <svg ref={ref} width="99vw" height="99vh">
            <MetaData
                broadcast={currentBroadcast || broadcasts[N - 1]}
                x={width / 2}
            />
            {width &&
                height &&
                broadcasts
                    .slice(0, N)
                    .map((d, i) => (
                        <Broadcast
                            key={d.id}
                            x={xScale(d.created_at)}
                            y={height / 2}
                            size={sizeScale(d.open_rate)}
                            onMouseOver={() => setCurrentBroadcast(d)}
                            data={d}
                        />
                    ))}
        </svg>
    );
}

export default App;
