# Ortelius

Microservice Configuration Management - Track, Version, Find, Share and Deploy Microservices

[Overview of Ortelius](https://ortelius.io)

## TL;DR

```console
$ openssl genpkey -out jwt.pri -algorithm RSA -pkeyopt rsa_keygen_bits:2048
$ openssl pkey -in jwt.pri -pubout -out jwt.pub
$ helm repo add ortelius https://ortelius.github.io/ortelius-charts/
$ helm install my-release ortelius/ortelius --set ms-postgres.DBPassword=my_db_password --set ms-ms-nginx.SSLType=OFF --set ms-postgres.DBHost=orteliusdb.us-east-1.rds.amazonaws.com --set-file ms-jwt.JwtPrivateKey=jwt.pri --set-file ms-jwt.JwtPublicKey=jwt.pub
```

## Introduction

This chart deploys all of the required secrets, services, and deployments on a [Kubernetes](https://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- Public/Private RSA PKCS#8 Key Pair for JWT Tokens
- External Postgres Database

## Installing the Chart

To install the chart with the release name `my-release`:

```console
$ helm install my-release ortelius/ortelius --set ms-postgres.DBPassword=my_db_password --set ms-postgres.DBHost=orteliusdb.us-east-1.rds.amazonaws.com --set ms-ms-nginx.SSLType=OFF --set-file ms-jwt.JwtPrivateKey=jwt.pri --set-file ms-jwt.JwtPublicKey=jwt.pub
```

The command deploys Ortelius on the Kubernetes cluster using the following parameters:
- ms-postgres.DBPassword = Postgres Database Password
- ms-postgres.DBHost = Postgres Database Hostname
- ms-ms-nginx.SSLType = OFF (Disable the use of SSL certificates)
- ms-jwt.JwtPrivateKey = Private RSA PKCS#8 Key for creating the JWT Token
- ms-jwt.JwtPublicKey = Public RSA PKCS#8 Key for creating the JWT Token

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
$ helm delete my-release
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Parameters

### Common parameters

| Name                     | Description                                                                                  | Value           |
| ------------------------ | -------------------------------------------------------------------------------------------- | --------------- |
| `ms-postgres.DBUserName` | Postgres Database User Name                                                                  | `postgres`      |
| `ms-postgres.DBPassword` | Postgres Database Password                                                                   | `postgres`      |
| `ms-postgres.DBName      | Postgres Database Name                                                                   | `postgres`      |
| `ms-postgres.DBHost`     | Postgres Database Host Name                                                                  | `localhost`     |
| `ms-postgres.DBPort`     | Postgres Database Port                                                                       | `5432`          |
| `ms-nginx.SSLType`    | Enable SSL                                                                                   | `ON or OFF`     |
| `ms-nginx.SSLChainedCert`    | SSL Chained Certificate - used when ms-nginx.SSLType=ON                            | `SSL Chained Certificate - decoded` |
| `ms-nginx.SSLPrivateKey`    | SSL Private Key for SSL Chained Cert - used when ms-nginx.SSLType=ON                | `SSL Private Key - decoded` |
| `jwt.JwtPrivateKey`    | Private RSA PKCS#8 Key used to create JWT Tokens                                            | `Private RSA PKCS#8 Key - decoded` |
| `jwt.JwtPublicKey`    | Public RSA PKCS#8 Key used to create JWT Tokens                                            | `Public RSA PKCS#8 Key - decoded` |

> NOTE: Once this chart is deployed, it is not possible to change the application's access credentials, such as usernames or passwords, using Helm. To change these application credentials after deployment, delete any persistent volumes (PVs) used by the chart and re-deploy it, or use the application's built-in administrative tools if available.

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the chart. For example,

```console
helm install my-release -f values.yaml ortelius/ortelius
```
