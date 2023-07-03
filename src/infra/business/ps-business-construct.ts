import { LambdaIntegration, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { ProjenStacksProps } from '../projen-stacks';

export interface PSBusinessConstructProps extends ProjenStacksProps {
  seResource: Resource;
  restApi: RestApi;
  dbTable: Table;
}

export class PSBusinessConstruct extends Construct {
  constructor(scope: Construct, id: string, props: PSBusinessConstructProps) {
    super(scope, id);

    const { seResource, dbTable, envConfig } = props;

    // <domain>/v1/booking
    const bookingResource = seResource.addResource('booking');

    // PUT API
    const submitBookingLambda = new NodejsFunction(this, `${envConfig.appEnv}-submit-booking`, {
      functionName: `${envConfig.appEnv}-submit-booking`,
      description: 'Submit booking example PUT API',
      entry: 'src/app/business/shift/api/submit/index.ts',
      environment: {
        tableName: dbTable.tableName,
      },
    });
    dbTable.grantWriteData(submitBookingLambda);
    bookingResource.addMethod('PUT', new LambdaIntegration(submitBookingLambda));

    // GET API
    const getBookingLambda = new NodejsFunction(this, `${envConfig.appEnv}-get-shift-by-id`, {
      functionName: `${envConfig.appEnv}-get-shift-by-id`,
      description: 'Submit booking example PUT API',
      entry: 'src/app/business/shift/api/get-by-id/index.ts',
      environment: {
        tableName: dbTable.tableName,
      },
    });
    dbTable.grantReadData(getBookingLambda);
    bookingResource.addMethod('GET', new LambdaIntegration(getBookingLambda));
  }
}
