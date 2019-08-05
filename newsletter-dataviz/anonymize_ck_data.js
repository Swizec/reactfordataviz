const csv = require("csv-parser");
const fs = require("fs");
const uuidv4 = require("uuid/v4");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const emailToUUID = {};
const data = {};

function parseSubscribers() {
    return new Promise(resolve => {
        fs.createReadStream("public/data/all_subscribers.csv")
            .pipe(csv())
            .on("data", row => {
                if (!emailToUUID[row.email]) {
                    emailToUUID[row.email] = uuidv4();
                }

                const uid = emailToUUID[row.email];

                data[uid] = {
                    uid,
                    created_at: row.old_created_at || row.created_at,
                    status: row.status
                };
            })
            .on("end", resolve);
    });
}

function parseInactive(path) {
    return new Promise(resolve => {
        fs.createReadStream(path)
            .pipe(csv())
            .on("data", row => {
                if (!emailToUUID[row.email]) {
                    emailToUUID[row.email] = uuidv4();
                }

                const uid = emailToUUID[row.email];

                if (data[uid]) {
                    data[uid] = {
                        ...data[uid],
                        unsubscribed: row.created_at,
                        status: row.status
                    };
                } else {
                    data[uid] = {
                        uid,
                        created_at: row.old_created_at || "",
                        unsubscribed: row.created_at,
                        status: row.status
                    };
                }
            })
            .on("end", resolve);
    });
}

async function writeData() {
    const csvWriter = createCsvWriter({
        path: "public/data/subscribers.csv",
        header: [
            { id: "uid", title: "uid" },
            { id: "created_at", title: "created at" },
            { id: "status", title: "status" }
        ]
    });

    await csvWriter.writeRecords(Object.values(data));
}

async function anonymize() {
    await parseSubscribers();

    await writeData();
}

anonymize();
