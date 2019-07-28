const { createClient } = require("@typeform/api-client");
const fs = require("fs");

// If you steal this token, you can read some of my data
// But you can't write, sorry :)
const typeformAPI = createClient({
    token: "2FSATFeTe63f15fQSQmmQC1mTWMADLXfRXY6oQFnevWN"
});

const START_DATE = new Date("2019-01-06 00:00 UTC");

async function scrapeData() {
    const workspaces = await typeformAPI.workspaces
        .list({
            pageSize: 200
        })
        .then(res =>
            res.items.filter(({ name }) =>
                ["Post Emails", "Emails"].includes(name)
            )
        );

    const allForms = await Promise.all(
        workspaces.map(({ id }) =>
            typeformAPI.forms
                .list({ workspaceId: id, pageSize: 200 })
                .then(forms => forms.items)
        )
    );

    const forms = allForms
        .reduce((acc, arr) => [...acc, ...arr], []) // node 10 doesn't have .flat
        .filter(f => new Date(f.last_updated_at) > START_DATE);

    const responses = await Promise.all(
        forms.map(form =>
            typeformAPI.responses
                .list({ pageSize: 200, uid: form.id })
                .then(res => ({ form: form.id, responses: res.items }))
        )
    );

    fs.writeFileSync("public/data/forms.json", JSON.stringify(forms));
    fs.writeFileSync("public/data/responses.json", JSON.stringify(responses));
}

scrapeData();
