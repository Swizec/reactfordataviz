import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as d3 from "d3";

const CenteredText = styled.text`
    text-anchor: middle;
    dominant-baseline: central;
`;

function useDropAnimation({ duration, height, id, delay }) {
    const [y, sety] = useState(0);

    useEffect(() => {
        d3.selection()
            .transition(`drop-anim-${id}`)
            .ease(d3.easeCubicInOut)
            .duration(duration * 1000)
            .delay(delay)
            .tween(`drop-tween-${id}`, () => {
                const interpolate = d3.interpolate(0, height);
                return t => sety(interpolate(t));
            });
    }, []);

    return y;
}

const Heart = ({ index, height, id, dropDuration }) => {
    const y = useDropAnimation({
        id,
        duration: dropDuration,
        height: height,
        delay: index * 100 + Math.random() * 75
    });

    return (
        <CenteredText x={0} y={y} fontSize="12px">
            ❤️
        </CenteredText>
    );
};

const Hearts = ({ bid, hearts, height }) => {
    return (
        <>
            {d3.range(0, hearts).map(i => (
                <Heart
                    key={i}
                    index={i}
                    id={`${bid}-${i}`}
                    height={height - i * 10}
                    dropDuration={3}
                />
            ))}
        </>
    );
};

const Broadcast = ({ x, y, size, data, onMouseOver }) => {
    const responses = data.responses ? data.responses.responses : [];

    // ratings > 3 are a heart, probably
    const hearts = responses
        .map(r => (r.answers ? r.answers.filter(a => a.type === "number") : []))
        .flat()
        .filter(({ number }) => number > 3).length;

    return (
        <g
            transform={`translate(${x}, ${y})`}
            onMouseOver={onMouseOver}
            style={{ cursor: "pointer" }}
        >
            <CenteredText x={0} y={0} fontSize={`${size}pt`}>
                💌
            </CenteredText>
            <Hearts hearts={hearts} bid={data.id} height={y - 10} />
        </g>
    );
};

export default Broadcast;
