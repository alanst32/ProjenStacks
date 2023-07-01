import { Stack } from "aws-cdk-lib";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { IHostedZone } from "aws-cdk-lib/aws-route53";

export interface MyStack extends Stack {
  readonly apiDomain: string;
  readonly certificate: ICertificate;
  readonly dbTable: Table;
  readonly hostedZone: IHostedZone;
  readonly restApi: RestApi;
}
