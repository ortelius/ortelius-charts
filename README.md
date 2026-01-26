# Ortelius Helm Charts

This repository serves as the **central Helm chart aggregation and publication point** for the Ortelius platform.

It supports a **poly-repository Helm architecture**, allowing individual Ortelius microservices to maintain their own Helm charts while publishing a **single consolidated chart repository** to [Artifact Hub](https://artifacthub.io).

---

## Repository Purpose

This repository has two primary functions:

### 1. Helm Chart Aggregation

It contains a Node.js-based aggregator that:

- Collects Helm chart metadata from multiple Ortelius GitHub repositories
- Retrieves each chart’s `index.yaml` file from its `gh-pages` branch
- Merges all chart entries into one consolidated `index.yaml`
- Produces a unified Helm chart repository suitable for Artifact Hub

This enables Ortelius to maintain **independent microservice Helm charts** while presenting them to users as **one installable Helm source**.

---

### 2. Artifact Hub Publication

The aggregated Helm index is published as a single package to Artifact Hub, allowing users to:

```bash
helm repo add ortelius https://ortelius.github.io/ortelius-charts
helm repo update


### Usage
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

## Ortelius Helm Installation

For full installation instructions, configuration values, and deployment options, see:

## Helm Chart Aggregator
Overview

The aggregator enables a poly-repo Helm model:

- Each microservice owns its own Helm chart
- Each repo runs the Helm chart-releaser GitHub Action
- Each chart publishes to its own gh-pages branch
- his repository pulls those indexes together into one

This avoids:

- A single monolithic Helm repo
- Cross-team coupling
- Centralized chart ownership bottlenecks

How It Works

- For each configured repository:
- The Helm chart-releaser GitHub Action generates:

 bash
gh-pages/index.yaml

The aggregator:

- Downloads the index.yaml file
- Extracts chart metadata
- Normalizes version references
- Merges all chart entries

A single consolidated index.yaml is produced and published.

## Configuration

To add or remove Helm chart sources, update the chartRepos array in main.js.

Example:

~~~ javascript

const chartRepos = [
    "ortelius/ortelius",
    "ortelius/ortelius-ms-dep-pkg-cud",
    "ortelius/ortelius-ms-dep-pkg-r",
    "ortelius/ortelius-ms-textfile-crud",
    "ortelius/ortelius-ms-compitem-crud",
    "ortelius/ortelius-ms-validate-user",
    "<githubOrg>/<repoName>"
];

~~~

### Each repository listed must:

- Contain a Helm chart
- Use the Helm chart-releaser GitHub Action
- Publish its chart index to the gh-pages branch
- Requirements for Chart Repositories
- Each Helm chart repository must:
- Follow standard Helm chart structure
- Include a valid Chart.yaml
- Run the Helm chart-releaser action
- Publish artifacts to GitHub Pages (gh-pages)
- Reference implementation: [https://github.com/helm/chart-releaser-action](https://github.com/helm/chart-releaser-action)


