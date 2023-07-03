import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

import { ProjenStacksProps } from './projen-stacks';
import { getStackName } from './utils/utils';

export class PSDynamoConstruct extends Construct {
  readonly dbTable: Table;

  constructor(scope: Stack, id: string, props: ProjenStacksProps) {
    super(scope, id);

    this.dbTable = new Table(this, 'ProjenStacksTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'ttl',
      tableName: getStackName(props.envConfig.appEnv),
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      pointInTimeRecovery: true,
    });
  }
}
