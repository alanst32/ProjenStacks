import {
  RestApi,
  SecurityPolicy,
  EndpointType,
} from "aws-cdk-lib/aws-apigateway";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

import { ProjenStacksProps } from "./projen-stacks";

export interface PSRestApiConstructProps extends ProjenStacksProps {
  readonly certificate: ICertificate;
  readonly apiDomain: string;
}

export class PSRestApiConstruct extends Construct {
  readonly restApi: RestApi;

  constructor(scope: Construct, id: string, props: PSRestApiConstructProps) {
    super(scope, id);

    const { certificate, apiDomain } = props;

    this.restApi = new RestApi(this, "api", {
      restApiName: "SampleApi",
      description: "Lambda Backed API",
      deployOptions: {
        stageName: "dev",
        metricsEnabled: true,
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
