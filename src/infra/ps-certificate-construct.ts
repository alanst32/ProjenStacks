import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { ProjenStacksProps } from './projen-stacks';
import { restApiDomainName } from './utils/utils';

export interface PSCertificateConstructProps extends ProjenStacksProps {
  hostedZone: IHostedZone;
  subjectAlternativeNames?: string[];
}

/**
 * Creating Certificate for the custom domain names
 */
export class PSCertificateConstruct extends Construct {
  public readonly certificate: ICertificate;
  public readonly restApiDomainName: string;

  constructor(scope: Construct, id: string, props: PSCertificateConstructProps) {
    super(scope, id);

    const { envConfig, hostedZone } = props;

    this.restApiDomainName = restApiDomainName(hostedZone.zoneName, envConfig.appEnv);
    this.certificate = Certificate.fromCertificateArn(this, `cert-${hostedZone.zoneName}`, envConfig.certificateArn);

    // // Create ACM cert expiry alarm
    // this.certificate.metricDaysToExpiry().createAlarm(this, `${envConfig.appEnv}-RestApiDomainCertExpiryAlarm`, {
    //   comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
    //   evaluationPeriods: 1,
    //   threshold: 45, // Automatic rotation should happen before if not alarm triggers
    // });

    // For Wild Card option
    // this.certificate = new Certificate(this, "certificate", {
    //   domainName: props.zone.zoneName,
    //   subjectAlternativeNames: (props.subjectAlternativeNames || []).concat([
    //     `*.${props.zone.zoneName}`,
    //   ]),
    // });

    // Please see https://github.com/aws/aws-cdk/issues/15574
    // const domainNames = [envConfig.zoneName, ...(props.subjectAlternativeNames || [])];
    // const validationOptions = domainNames.map(domainName => ({
    //   domainName,
    //   hostedZoneId: envConfig.zoneId,
    // }));
    // const cfnCertificate = this.certificate.node.defaultChild as CfnCertificate;
    // cfnCertificate.domainValidationOptions = validationOptions;
  }
}
