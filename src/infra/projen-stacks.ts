import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { PSBusinessConstruct } from './business/ps-business-construct';
import { MyStack } from './common/stack';
import { EnvConfig } from './config/types';
import { PSCertificateConstruct } from './ps-certificate-construct';
import { PSDynamoConstruct } from './ps-dynamo-construct';
import { PSNetworkConstruct } from './ps-network-construct';
import { PSRestApiConstruct } from './ps-rest-construct';

export interface ProjenStacksProps extends StackProps {
  envConfig: EnvConfig;
}

export class ProjenStacks extends Stack implements MyStack {
  readonly apiDomain: string;
  readonly certificate: ICertificate;
  readonly hostedZone: IHostedZone;
  readonly restApi: RestApi;
  readonly dbTable: Table;
  readonly seResource: Resource;

  constructor(scope: App, id: string, props: ProjenStacksProps) {
    super(scope, id, props);

    // NETWORK
    const network = new PSNetworkConstruct(this, 'net-id', {
      ...props,
    });
    this.apiDomain = network.apiDomain;
    this.hostedZone = network.hostedZone;

    // CERTIFICATE
    this.certificate = new PSCertificateConstruct(this, 'regional-cert', {
      ...props,
      hostedZone: this.hostedZone,
    }).certificate;

    // REST API
    this.restApi = new PSRestApiConstruct(this, 'rest-api-id', {
      ...props,
      apiDomain: this.apiDomain,
      certificate: this.certificate,
    }).restApi;
    this.seResource = this.restApi.root.addResource('v1');

    // // Create DNS Alias record targeting to the APIGW
    new ARecord(this, `${props.envConfig.appEnv}-RestApiAliasRecord`, {
      zone: this.hostedZone,
      recordName: this.apiDomain,
      target: RecordTarget.fromAlias(new targets.ApiGateway(this.restApi)),
    });

    // DYNAMO
    this.dbTable = new PSDynamoConstruct(this, 'dynamo-construct', {
      ...props,
    }).dbTable;

    // BUSINESS
    new PSBusinessConstruct(this, 'ps-business', {
      ...props,
      seResource: this.seResource,
      restApi: this.restApi,
      dbTable: this.dbTable,
    });

    // Testing PR
  }
}
