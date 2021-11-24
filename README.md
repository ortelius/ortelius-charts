# ortelius-charts

This code takes in an array of GitHub Repos that runs the `chart-releaser` GitHub action from Helm.

It retrieves the `index.yaml` file from the `gh-pages` branch of each repo and combines their entries into a single, consolidated `index.yaml`, enabling a poly repo chart setup to be uploaded to ArtifactHUB as one package.

---
## Usage
Simply update the `chartsRepo` variable in `main.js` and insert the appropriate repo name for its `index.yaml` to be retrieved.

```js
const chartRepos = [
    "ortelius/ortelius",
    "ortelius/ortelius-ms-dep-pkg-cud",
    "ortelius/ortelius-ms-dep-pkg-r",
    "ortelius/ortelius-ms-textfile-crud",
    "ortelius/ortelius-ms-compitem-crud",
    "ortelius/ortelius-ms-validate-user",
    "<githubUser>/<repoName>",
]
```