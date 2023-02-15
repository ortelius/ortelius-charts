# Ortelius

![Version: 10.0.77](https://img.shields.io/badge/Version-10.0.77-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: v10.0.0](https://img.shields.io/badge/AppVersion-v10.0.0-informational?style=flat-square)

Ortelius is a central evidence store of all your security and DevOps intelligence. It provides comprehensive, end-to-end insights across all of your clusters and logical applications from a single dashboard. Centrally view microservice and application level SBOMs, CVEs, deployed inventory, application to microservice dependencies, impact analysis, application versions, and the use of open-source packages across the entire organization. 


[Visit Ortelius](https://ortelius.io)

## Additional Information

This chart deploys all of the required secrets, services, and deployments on a [Kubernetes](https://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

### Changes in 10.0.54 - 10.0.77
Updated all base images to remove vulnerabilities. Used cgr.dev/chainguard/python, cgr.dev/chainguard/jdk:latest, and python:3.10-alpine, eclipse-temurin:8-jdk-alpine base images. The cgr.dev ones work great if you do not have additional packages (openssl) to install otherwise alpine is needed.

cgr.dev is based on wolfi. Google distroless has vulnerabilities in the base image so they should not be used.


### Changes in 10.0.53

* Added new Microservice for ScoreCard
* Updated ingress for running local Kind Cluster
* Removed dependency on external jwt keys

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- External Postgres Database

## Install Command

To install the chart with the release name `my-release`:

```console
helm repo add ortelius https://ortelius.github.io/ortelius-charts/
helm install my-release ortelius/ortelius --set ms-general.dbpass=my_db_password --set ms-nginx.ingress.type=ssloff --set ms-general.dbhost=orteliusdb.us-east-1.rds.amazonaws.com
```


The command deploys DeployHub on the Kubernetes cluster using the following parameters:
- ms-general.dbpass = Postgres Database Password
- ms-general.dbhost = Postgres Database Hostname
- ms-nginx.ingress.type = ssloff (Disable the use of SSL certificates)

> **Tip**: List all releases using `helm list`


## Parameters

### Common parameters

| Name                     | Description                                                                                  | Value           |
| ------------------------ | -------------------------------------------------------------------------------------------- | --------------- |
| `ms-general.dbuser`     | Postgres Database User Name                                                                  | `postgres`      |
| `ms-general.dbpass`     | Postgres Database Password                                                                   | `postgres`      |
| `ms-general.dbname`     | Postgres Database Name                                                                       | `postgres`      |
| `ms-general.dbhost`     | Postgres Database Host Name                                                                  | `localhost`     |
| `ms-general.dbport`     | Postgres Database Port                                                                       | `5432`          |
| `ms-nginx.ingress.type` | ssloff = non ssl enabled, alb = add alb ingress, volumemnt = certs come from existing ssl volume, sslcert = add certs a opaque secret | `sslcert, alb, volumemnt, ssloff`  |
| `ms-nginx.ingress.sslcert.chainedcert`    | SSL Chained Certificate - required when `dh-ms-nginx.ingress.type=sslcert`                     | `SSL Chained Certificate - decoded` |
| `ms-nginx.ingress.sslcert.privatekey`    | SSL Private Key for SSL Chained Cert - required when `dh-ms-nginx.ingress.type=sslcert`         | `SSL Private Key - decoded`         |
| `ms-nginx.ingress.alb_subnets`    | String of comma delimited subnets for the ALB - required when  `dh-ms-nginx.ingress.type=alb`  |   |
| `ms-nginx.ingress.alb_certificate_arn`    | ARN for the certificate from AWS Certificate Manager - required when  `dh-ms-nginx.ingress.type=alb` |  |
| `ms-nginx.ingress.dnsname`   | DNS Name that matches the certificate from AWS Certificate Manager - required when  `ms-nginx.ingress.type=alb` |  |
| `ms-nginx.ingress.scheme`    | ALB scheme - required when  `dh-ms-nginx.ingress.type=alb` |  `internal` or `internet-facing` default: `internal`|

> NOTE: Once this chart is deployed, it is not possible to change the application's access credentials, such as usernames or passwords, using Helm. To change these application credentials after deployment, delete any persistent volumes (PVs) used by the chart and re-deploy it, or use the application's built-in administrative tools if available.

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the chart. For example,

```console
helm install my-release -f values.yaml ortelius/ortelius
```
## Accessing the Ortelius UI After the Chart Install
- Use a port forward with kubectl to the ms-nginx microservice service
- `kubectl port-forward TYPE/NAME [options] LOCAL_PORT:REMOTE_PORT`
- kubectl port-forward help
```
kubectl port-forward -h
```
- 8080 represents the local port on your machine http://localhost:8080
```
kubectl port-forward svc/ms-nginx 8080:80 -n ortelius
```
- 8443 represents the local port on your machine http://localhost:8443
```
kubectl port-forward svc/ms-nginx 8443:443 -n ortelius
```
## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
helm delete my-release
```

The command removes all the Kubernetes components associated with the chart and deletes the release.
