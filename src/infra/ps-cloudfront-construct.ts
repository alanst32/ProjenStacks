import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { RestApiOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { ProjenStacksProps } from './projen-stacks';
import { isProdEnv } from './utils/utils';

export interface PSCloudFrontConstructProps extends ProjenStacksProps {
  apiDomain: string;
  hostedZone: IHostedZone;
  cdnCertificate: Certificate;
  restApi: RestApi;
}

export class PSCloudFrontConstruct extends Construct {
  constructor(scope: Construct, id: string, props: PSCloudFrontConstructProps) {
    super(scope, id);

    const { apiDoman, cdnCertificate, envConfig, hostedZone, restApi } = props;

    const cdnDistribution = new Distribution(this, `${id}-${apiDoman}-cloudfront`, {
      domainNames: [apiDoman],
      certificate: cdnCertificate,
      enableLogging: isProdEnv(envConfig.appEnv),
      defaultBehavior: {
        origin: new RestApiOrigin(restApi),
      },
    });
  }
}

/*
 const cloudFrontDistribution = new Distribution(this, `${name}-${subdomain}-cloudfront`, {
      domainNames: [`${subdomain}.${this.hostedZone.zoneName}`],
      defaultRootObject: 'index.html',
      certificate: this.certificate,
      enableLogging: false,
      defaultBehavior
    })

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
*/
