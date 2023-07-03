import { RestApi, SecurityPolicy, EndpointType, Cors } from 'aws-cdk-lib/aws-apigateway';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

import { ProjenStacksProps } from './projen-stacks';

export interface PSRestApiConstructProps extends ProjenStacksProps {
  readonly certificate: ICertificate;
  readonly apiDomain: string;
}

export class PSRestApiConstruct extends Construct {
  readonly restApi: RestApi;

  constructor(scope: Construct, id: string, props: PSRestApiConstructProps) {
    super(scope, id);

    const { certificate, apiDomain, envConfig } = props;
    const { appEnv } = envConfig;

    this.restApi = new RestApi(this, 'api', {
      restApiName: `pj-${appEnv}-api`,
      description: 'Lambda Backed API',
      deployOptions: {
        stageName: 'dev',
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Authorization',
          'Content-Type',
          'Location',
          'Set-Cookie',
          'timeout',
          'X-Amz-Date',
          'X-Amz-Security-Token',
          'X-TransactionID',
          'x-datadog-origin',
          'x-datadog-parent-id',
          'x-datadog-sampled',
          'x-datadog-sampling-priority',
          'x-datadog-trace-id',
          'x-amzn-requestId',
          'x-amazon-apigateway-binary-media-types',
          'x-filename',
          'x-proofType',
          'x-uploadType',
          'x-client-id',
          'x-client-secret',
          'x-api-key',
        ],
        // TODO allow origins prod
        allowOrigins: appEnv === 'prod' ? [] : Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true,
      },
      domainName: {
        domainName: apiDomain,
        certificate: certificate,
        securityPolicy: SecurityPolicy.TLS_1_2,
        endpointType: EndpointType.REGIONAL,
      },
    });
  }
}
