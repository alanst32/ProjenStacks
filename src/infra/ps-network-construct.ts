import { CaaAmazonRecord, HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { ProjenStacksProps } from './projen-stacks';
import { restApiDomainName } from './utils/utils';

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

    this.hostedZone = HostedZone.fromHostedZoneAttributes(this, `${id}-hosted-zone`, {
      hostedZoneId: envConfig.hostedZone.id,
      zoneName: envConfig.hostedZone.name,
    });

    this.apiDomain = restApiDomainName(this.hostedZone.zoneName, envConfig.appEnv);

    new CaaAmazonRecord(this, `${id}-caa-record`, { zone: this.hostedZone });
  }
}
