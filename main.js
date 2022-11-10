const axios = require("axios");
const yaml = require('js-yaml');
const fs = require('fs');
const { exit } = require("process");

const chartRepos = [
    "ortelius/ortelius",
    "ortelius/ms-dep-pkg-cud",
    "ortelius/ms-dep-pkg-r",
    "ortelius/ms-textfile-crud",
    "ortelius/ms-compitem-crud",
    "ortelius/ms-validate-user",
    "ortelius/ms-scorecard",
]

// Helper functions
async function getChartEntries() {
    await axios.get('https://raw.githubusercontent.com/ortelius/ortelius/main/chart/Chart.yaml').then(response => {
        let parsedYaml = yaml.load(response.data)
        chartVersion = parsedYaml['version'];
        parts = chartVersion.split('.');
        ver = parseInt(parts[2]) + 1;
        parts[2] = ver.toString();
        chartVersion = parts.join('.');
    });

    latest_chart = [];

    for (let i = 0; i < chartRepos.length; i++) {
        const repoUrl = `https://github.com/${chartRepos[i]}/raw/gh-pages/index.yaml`;
        
        await axios.get(repoUrl).then(response => {
            let parsedYaml = yaml.load(response.data)
            let entries = parsedYaml.entries

            Object.keys(entries).forEach(key => {

                latest = null;

                Object.entries(entries[key]).forEach(entry => {
                    
                    if (latest == null)
                        latest = entry;
                    else if (latest['created'] < entry['created'])
                        latest = entry;
                });
                latest = latest[1];
                dep = {};
                dep['name'] = latest['name'];
                dep['version'] = latest['version'];
                dep['repository'] = 'https://ortelius.github.io/' + key + '/'
                latest_chart.push(dep);

            //    chartEntries[key] = entries[key]
            //    console.log(entries[key]);
            });
        })
    }
    chartEntries = latest_chart;
    return latest_chart;
}

function createYamlOutput() {
    const output = yaml.dump({
        apiVersion: 'v2',
        name: 'ortelius',
        cdescription: 'Ortelius',
        home: 'https://www.ortelius.io',
        icon: 'https://ortelius.github.io/ortelius-charts/logo.png',
        keywords: [ 'Service Catalog', 'Microservices', 'SBOM' ],
        type: 'application',
        version: chartVersion,
        appVersion: '10.0.0',
        generated: new Date().toISOString(),
        dependencies: chartEntries,
    }, {noArrayIndent: true})

    return output
}
// -----------------

let chartEntries = []
let chartVersion = ''

getChartEntries().then(() => {
    const yamlOutput = createYamlOutput()
    console.log(yamlOutput);
    fs.writeFileSync("./index-temp.yaml", yamlOutput, "utf8", (err) => {
        console.log(err)
    })
})
