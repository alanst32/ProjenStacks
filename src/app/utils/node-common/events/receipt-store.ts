import { DynamoDB as Dyn } from 'aws-sdk';
import { ReceiptError } from './error';
import { FunctionEventKey } from './types';
import { getTimeToLive } from '../aws/dynamo/utils';
import { withErrorCheck } from '../aws/utils';
import { log } from '../log';

export type EventReceiptStore = {
  keep: (key: FunctionEventKey) => Promise<void>;
  remove: (key: FunctionEventKey) => Promise<void>;
};

const toDynamoKey = (key: FunctionEventKey) => ({
  pk: `event#${key.id}`,
  sk: `function#${key.functionName}#receipt`,
});

export const DynEventReceiptStore = (table: string, ttlMinutes: number): EventReceiptStore => {
  const db = new Dyn.DocumentClient();

  return {
    keep: async (key: FunctionEventKey) => {
      await withErrorCheck(
        db.put({
          TableName: table,
          Item: {
            ...toDynamoKey(key),
            timestamp: new Date().toISOString(),
            ttl: getTimeToLive(ttlMinutes),
          },
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        }),
        'Failed keeping receipt'
      ).catch((error: any) => {
        if (error.code === 'ConditionalCheckFailedException') throw new ReceiptError('Receipt exists');
        else throw error;
      });

      log.trace({ key }, 'Event receipt stored');
    },
    remove: async (key: FunctionEventKey) => {
      await withErrorCheck(db.delete({ TableName: table, Key: toDynamoKey(key) }), 'Failed removing receipt');
      log.trace({ key }, 'Event receipt removed');
    },
  };
};
