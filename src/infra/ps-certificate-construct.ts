import {
  Certificate,
  CfnCertificate,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

import { ProjenStacksProps } from "./projen-stacks";

export interface PSCertificateConstructProps extends ProjenStacksProps {
  zone: IHostedZone;
  subjectAlternativeNames?: string[];
}

/**
 * Creating Certificate for the custom domain names
 */
export class PSCertificateConstruct extends Construct {
  public readonly certificate: ICertificate;

  constructor(
    scope: Construct,
    id: string,
    props: PSCertificateConstructProps
  ) {
    super(scope, id);

    // For Wild Card option
    // this.certificate = new Certificate(this, "certificate", {
    //   domainName: props.zone.zoneName,
    //   subjectAlternativeNames: (props.subjectAlternativeNames || []).concat([
    //     `*.${props.zone.zoneName}`,
    //   ]),
    // });

    this.certificate = new Certificate(this, "certificate", {
      domainName: props.zone.zoneName,
    });

    // Please see https://github.com/aws/aws-cdk/issues/15574
    const domainNames = [
      props.zone.zoneName,
      ...(props.subjectAlternativeNames || []),
    ];
    const validationOptions = domainNames.map((domainName) => ({
      domainName,
      hostedZoneId: props.zone.hostedZoneId,
    }));
    const cfnCertificate = this.certificate.node.defaultChild as CfnCertificate;
    cfnCertificate.domainValidationOptions = validationOptions;
  }
}
