const axios = require('axios')
const yaml = require('js-yaml')
const fs = require('fs')
require('process')

const chartRepos = [
  'ortelius/ms-dep-pkg-cud',
  'ortelius/ms-dep-pkg-r',
  'ortelius/ms-textfile-crud',
  'ortelius/ms-compitem-crud',
  'ortelius/ms-validate-user',
  'ortelius/ms-scorecard',
  'ortelius/ms-postgres',
  'ortelius/ortelius'
]

// Helper functions
async function getChartEntries () {
  let sha = ''

  await axios.get('https://api.github.com/repos/ortelius/ortelius-charts/commits/main').then(response => {
    sha = response.data.sha
  })

  const url = 'https://raw.githubusercontent.com/ortelius/ortelius-charts/' + sha + '/chart/ortelius/Chart.yaml'
  let parts = []
  let latest = ''
  let ver = ''

  await axios.get(url).then(response => {
    const parsedYaml = yaml.load(response.data)
    chartVersion = parsedYaml.version
    parts = chartVersion.split('.')
    ver = parseInt(parts[2]) + 1
    parts[2] = ver.toString()
    chartVersion = parts.join('.')
  })

  const latestChart = []

  for (let i = 0; i < chartRepos.length; i++) {
    await axios.get('https://api.github.com/repos/' + chartRepos[i] + '/commits/gh-pages').then(response => {
      sha = response.data.sha
    })

    const repoUrl = 'https://raw.githubusercontent.com/' + chartRepos[i] + '/' + sha + '/index.yaml'

    await axios.get(repoUrl).then(response => {
      const parsedYaml = yaml.load(response.data)
      const entries = parsedYaml.entries

      Object.keys(entries).forEach(key => {
        latest = null

        Object.entries(entries[key]).forEach(entry => {
          if (latest == null) { latest = entry } else if (latest.created < entry.created) { latest = entry }
        })
        latest = latest[1]
        const dep = {}
        dep.name = latest.name
        dep.version = latest.version

        if (key === 'ms-ui' || key === 'ms-nginx' || key === 'ms-general') { key = 'ortelius' }

        if (key === 'ms-postgres') { dep.condition = 'global.postgresql.enabled' }

        dep.repository = 'https://ortelius.github.io/' + key + '/'
        latestChart.push(dep)

        //    chartEntries[key] = entries[key]
        //    console.log(entries[key]);
      })
    })
  }
  chartEntries = latestChart
  return latestChart
}

function createYamlOutput () {
  const annotations = {}

  annotations['artifacthub.io/signKey'] = 'fingerprint: 115D42896E81EA5F774C5CDC7F398DEBAA126EB9\nurl: https://ortelius.io/ortelius.key'

  let output = yaml.dump({
    apiVersion: 'v2',
    name: 'ortelius',
    description: 'Supply Chain Evidence Catalog',
    home: 'https://www.ortelius.io',
    icon: 'https://ortelius.github.io/ortelius-charts/logo.png',
    keywords: ['Service Catalog', 'Microservices', 'SBOM', 'Supply Chain'],
    type: 'application',
    version: chartVersion,
    appVersion: '10.0.0',
    annotations,
    dependencies: chartEntries
  }, { noArrayIndent: true })

  output = output.replace('|-', '|')

  fs.readFile('./chart/ortelius/README.md', 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    const result = data.replace(/ORTELIUS_VERSION=\d+\.\d+\.\d+/g, 'ORTELIUS_VERSION=' + chartVersion)

    console.log(result)
    fs.writeFile('./chart/ortelius/README.md', result, 'utf8', function (err) {
      if (err) return console.log(err)
    })
  })

  return output
}
// -----------------

let chartEntries = []
let chartVersion = ''

getChartEntries().then(() => {
  const yamlOutput = createYamlOutput()
  console.log(yamlOutput)
  fs.writeFileSync('./chart/ortelius/Chart.yaml', yamlOutput, 'utf8', (err) => {
    console.log(err)
  })
})
