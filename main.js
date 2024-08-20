const axios = require('axios');
const { execSync } = require('child_process');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
require('process');

const chartRepos = [
  'ortelius/ms-dep-pkg-cud',
  'ortelius/ms-dep-pkg-r',
  'ortelius/ms-textfile-crud',
  'ortelius/ms-compitem-crud',
  'ortelius/ms-validate-user',
  'ortelius/ms-sbom-export',
  'ortelius/ms-scorecard',
  'ortelius/ms-postgres',
  'ortelius/ortelius'
]

// Function to extract deployment image information
function extractDeploymentImage(resource) {
  const deploymentImages = [];

  if (!resource)
   return deploymentImages;

  // Check if the resource is a Deployment
  if (resource.kind === 'Deployment' && resource.spec && resource.spec.template && resource.spec.template.spec && resource.spec.template.spec.containers) {
      // Extract container images from the Deployment
      const containers = resource.spec.template.spec.containers;
      containers.forEach(container => {
          if (container.image) {
              deploymentImages.push(container.image);
          }
      });
  }

  return deploymentImages;
}

function getLatestCommitSha(owner, repo, branch) {
  // Create a temporary directory
  const tempDir = tmp.dirSync().name;

  try {
    // Clone the repository without checking out files and change to tempDir
    process.chdir(tempDir);
    const repoUrl = `https://github.com/${owner}/${repo}.git`;
    console.log(repoUrl);
    execSync(`git clone --no-checkout --branch ${branch} --depth 1 ${repoUrl} .`);

    // Get the SHA of the latest commit on the specified branch
    const sha = execSync(`git rev-parse origin/${branch}`).toString().trim();

    return sha;
  } finally {
    // Change back to the original working directory
    process.chdir(__dirname);

    // Clean up: Delete the temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  }
}

// Helper functions
async function getChartEntries () {
  let sha = ''

  sha = getLatestCommitSha("ortelius", "ortelius-charts", "main");

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
    let [owner, repo] = chartRepos[i].split('/');
    sha = getLatestCommitSha(owner, repo, "gh-pages");

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

   // console.log(result)
    fs.writeFile('./chart/ortelius/README.md', result, 'utf8', function (err) {
      if (err) return console.log(err)
    })
  })

  return output
}
// -----------------

let chartEntries = [];
let chartVersion = '';


const imageTags = []; // Declare imageTags outside the getChartEntries block

getChartEntries().then(() => {
  const yamlOutput = createYamlOutput();
  // console.log(yamlOutput)
  fs.writeFileSync('./chart/ortelius/Chart.yaml', yamlOutput, 'utf8', (err) => {
    console.log(err);
  });

  for (let chart of chartEntries) {
    let repo = chart.repository.replace("https://ortelius.github.io", "https://github.com/ortelius");
    let chartURL = repo + "releases/download/" + chart.name + "-" + chart.version + "/" + chart.name + "-" + chart.version + ".tgz";

    let helmTemplateOutput = '';

    try {
      // Execute `helm template` command and capture the output
      helmTemplateOutput = execSync("helm template " + chartURL, { encoding: 'utf-8' });
    } catch (error) {
      // Handle errors (you can customize this based on your requirements)
        console.error('Error executing helm template:', error.message);
    }

    // Parse all YAML documents in the stream
    const yamlDocuments = yaml.loadAll(helmTemplateOutput);

    // Iterate over each YAML document and extract deployment images
    yamlDocuments.forEach((yamlData, index) => {
      const deploymentImages = extractDeploymentImage(yamlData);
      for (const i in deploymentImages)
      {
        img = deploymentImages[i].replace("quay.io/ortelius/", "").replaceAll(':', ';').replaceAll('.', '_').replace(/-v(?=\d)/g, ';').replace(/(\d+)-g/g, '$1_g');
        imageTags.push('GLOBAL.Open Source.Linux Foundation.CDF.Ortelius.' + img);
      }
    });
  }

  const domain = 'GLOBAL.Open Source.Linux Foundation.CDF.Ortelius';
  const environment = 'ArtifactHub';
  const application = 'ortelius';

  let deploydata = {};

  deploydata['application'] = domain + '.' + application + ';' + chartVersion.replaceAll('.', '_');
  deploydata['environment'] = domain + '.' + environment;
  deploydata['rc'] = 0;
  deploydata['skipdeploy'] = 'Y';
  deploydata['compversion'] = imageTags;

  fs.writeFileSync('deploy.json', JSON.stringify(deploydata, null, 2));
});



