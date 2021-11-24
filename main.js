const axios = require("axios");
const yaml = require('js-yaml');
const fs = require('fs');

const chartRepos = [
    "ortelius/ortelius",
    "ortelius/ortelius-ms-dep-pkg-cud",
    "ortelius/ortelius-ms-dep-pkg-r",
    "ortelius/ortelius-ms-textfile-crud",
    "ortelius/ortelius-ms-compitem-crud",
    "ortelius/ortelius-ms-validate-user",
]

// Helper functions
async function getChartEntries() {
    for (let i = 0; i < chartRepos.length; i++) {
        const repoUrl = `https://github.com/${chartRepos[i]}/raw/gh-pages/index.yaml`;
        
        await axios.get(repoUrl).then(response => {
            let parsedYaml = yaml.load(response.data)
            let entries = parsedYaml.entries

            Object.keys(entries).forEach(key => {
                chartEntries[key] = entries[key]
            });
            return entries
        })
    }
}
function createYamlOutput() {
    const output = yaml.dump({
        apiVersion: "v1",
        entries: chartEntries,
        generated: new Date().toISOString()
    }, {noArrayIndent: true})

    return output
}
// -----------------

let chartEntries = {}

getChartEntries().then(() => {
    const yamlOutput = createYamlOutput()

    fs.writeFileSync("./index.yaml", yamlOutput, "utf8", (err) => {
        console.log(err)
    })
})
