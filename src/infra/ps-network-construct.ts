import {
  CaaAmazonRecord,
  HostedZone,
  IHostedZone,
} from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

import { getSubdomain } from "./config";
import { ProjenStacksProps } from "./projen-stacks";
/**
 * Setting network configuration
 * Route53, HostedZone
 */
export class PSNetworkConstruct extends Construct {
  readonly apiDomain: string;
  readonly hostedZone: IHostedZone;

  constructor(scope: Construct, id: string, props: ProjenStacksProps) {
    super(scope, id);

    const { envConfig } = props;

    this.hostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      `${id}-hosted-zone`,
      {
        hostedZoneId: envConfig.zoneId,
        zoneName: envConfig.zoneName,
      }
    );

    const [apiSubdomain] = ["api"].map(
      (subdomain) => `${getSubdomain(envConfig.appEnv, subdomain)}`
    );
    this.apiDomain = `${apiSubdomain}.${this.hostedZone.zoneName}`;

    new CaaAmazonRecord(this, `${id}-caa-record`, { zone: this.hostedZone });
  }
}
