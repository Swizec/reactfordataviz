import React from "react";
import * as d3 from "d3";
import styled from "styled-components";

const dateFormat = d3.timeFormat("%x");

const Heading = styled.text`
    font-size: 1.5em;
    font-weight: bold;
    text-anchor: middle;
`;

const MetaData = ({ broadcast, x }) => {
    if (!broadcast) return null;

    const responses = broadcast.responses ? broadcast.responses.responses : [];
    // ratings > 3 are a heart, probably
    const hearts = responses
        .map(r => (r.answers ? r.answers.filter(a => a.type === "number") : []))
        .flat();

    const heartRatio =
        (hearts.filter(({ number }) => number > 3).length / hearts.length) *
        100;

    const unsubRatio =
        broadcast.unsubscribes /
        ((broadcast.recipients * broadcast.open_rate) / 100);

    return (
        <>
            <Heading x={x} y={50}>
                {broadcast ? dateFormat(broadcast.created_at) : null}
            </Heading>
            <Heading x={x} y={75}>
                {broadcast ? broadcast.subject : null}
            </Heading>
            <text x={x} y={100} textAnchor="middle">
                ❤️ {heartRatio.toFixed(0)}% likes 📖{" "}
                {broadcast.open_rate.toFixed(0)}% reads 👆{" "}
                {broadcast.click_rate.toFixed(0)}% clicks 😢{" "}
                {unsubRatio.toFixed(2)}% unsubs
            </text>
        </>
    );
};

export default MetaData;
