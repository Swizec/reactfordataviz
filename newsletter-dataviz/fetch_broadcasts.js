const fetch = require("node-fetch");
const { CK_KEY } = require("./secrets.json");
const fs = require("fs");

async function getBroadcasts() {
    const page1 = await fetch(
        `https://api.convertkit.com/v3/broadcasts?page=1&api_secret=${CK_KEY}`
    ).then(res => res.json());
    const page2 = await fetch(
        `https://api.convertkit.com/v3/broadcasts?page=2&api_secret=${CK_KEY}`
    ).then(res => res.json());

    const broadcasts = [...page1.broadcasts, ...page2.broadcasts];

    const result = [];

    for (let broadcast of broadcasts) {
        const stats = await fetch(
            `https://api.convertkit.com/v3/broadcasts/${
                broadcast.id
            }/stats?api_secret=${CK_KEY}`
        ).then(res => res.json());

        result.push({
            ...broadcast,
            ...stats.broadcast.stats
        });
    }

    fs.writeFileSync("public/data/broadcasts.json", JSON.stringify(result));
}

getBroadcasts();
