import { LambdaIntegration, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { ProjenStacksProps } from '../projen-stacks';

export interface SENetworkConstructProps extends ProjenStacksProps {
  seResource: Resource;
  restApi: RestApi;
  dbTable: Table;
}

export class SENetworkConstruct extends Construct {
  constructor(scope: Construct, id: string, props: SENetworkConstructProps) {
    super(scope, id);

    const { seResource, dbTable } = props;

    // <domain>/v1/booking
    const bookingResource = seResource.addResource('booking');

    // PUT API
    const submitBookingLambda = new NodejsFunction(this, 'submit-booking', {
      functionName: 'submit-booking',
      description: 'Submit booking example PUT API',
      entry: 'src/app/business/shift/api/submit/index.ts',
      environment: {
        tableName: dbTable.tableName,
      },
    });
    dbTable.grantWriteData(submitBookingLambda);
    bookingResource.addMethod('PUT', new LambdaIntegration(submitBookingLambda));

    // GET API
    const getBookingLambda = new NodejsFunction(this, 'submit-booking', {
      functionName: 'submit-booking',
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
