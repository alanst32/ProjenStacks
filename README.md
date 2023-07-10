# Welcome to your CDK TypeScript project

![Build Status](https://github.com/alanst32/ProjenStacks/actions/workflows/build.yml/badge.svg)
![CodeQL Status](https://github.com/alanst32/ProjenStacks/actions/workflows/codeql-analysis.yml/badge.svg)
![Release Status](https://github.com/alanst32/ProjenStacks/actions/workflows/release.yml/badge.svg)

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy --profile cevo-sandbox-sso` deploy this stack to your default AWS account/region
- `cdk diff --profile cevo-sandbox-sso` compare deployed stack with current state
- `cdk synth --profile cevo-sandbox-sso` emits the synthesized CloudFormation template

## Run Demo

- `aws-sso-util login https://cevo.awsapps.com/start` Run on Cevo Hub
