import { App, Stack, StackProps } from "aws-cdk-lib";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { IHostedZone } from "aws-cdk-lib/aws-route53";

import { MyStack } from "./common/stack";
import { EnvConfig } from "./config/types";
import { PSCertificateConstruct } from "./ps-certificate-construct";
import { PSDynamoConstruct } from "./ps-dynamo-construct";
import { PSNetworkConstruct } from "./ps-network-construct";
import { PSRestApiConstruct } from "./ps-rest-construct";

export interface ProjenStacksProps extends StackProps {
  envConfig: EnvConfig;
}

export class ProjenStacks extends Stack implements MyStack {
  readonly apiDomain: string;
  readonly certificate: ICertificate;
  readonly hostedZone: IHostedZone;
  readonly restApi: RestApi;
  readonly dbTable: Table;

  constructor(scope: App, id: string, props: ProjenStacksProps) {
    super(scope, id, props);

    // NETWORK
    const network = new PSNetworkConstruct(this, "net-id", {
      ...props,
    });
    this.apiDomain = network.apiDomain;
    this.hostedZone = network.hostedZone;

    // CERTIFICATE
    this.certificate = new PSCertificateConstruct(this, "regional-cert", {
      ...props,
      zone: this.hostedZone,
    }).certificate;

    // REST API
    this.restApi = new PSRestApiConstruct(this, "rest-api-id", {
      ...props,
      apiDomain: this.apiDomain,
      certificate: this.certificate,
    }).restApi;
    this.restApi.root.addResource("v1");

    // DYNAMO
    this.dbTable = new PSDynamoConstruct(this, "dynamo-db-id", {
      ...props,
    }).dbTable;
  }
}
