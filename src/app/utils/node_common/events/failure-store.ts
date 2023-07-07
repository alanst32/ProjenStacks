import { DynamoDB as Dyn } from 'aws-sdk';
import { FunctionEventKey, Timestamp } from './types';
import { getTimeToLive } from '../aws/dynamo/utils';
import { log } from '../log';
import { withErrorCheck } from '../aws/utils';

export type Failure = { timestamp: Timestamp; message: string };

export type FailureStore = {
    get: (key: FunctionEventKey) => Promise<Failure[]>;
    add: (key: FunctionEventKey, message: string) => Promise<void>;
};

const toDynamoKey = (key: FunctionEventKey, timestamp?: Date) => ({
    pk: `event#${key.id}`,
    sk: `function#${key.functionName}#failure#${timestamp?.getTime() || ''}`,
});

export const DynFailureStore = (table: string, ttlMinutes = 1440): FailureStore => {
    const db = new Dyn.DocumentClient();

    return {
        get: async (key: FunctionEventKey) => {
            const { pk, sk } = toDynamoKey(key);

            const res = await withErrorCheck(
                db.query({
                    TableName: table,
                    KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
                    ExpressionAttributeValues: { ':pk': pk, ':sk': sk },
                    ExpressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
                }),
                'Failed getting key in DynFailureStore'
            );

            return (
                res.Items?.map(item => ({
                    timestamp: item.timestamp,
                    message: item.body.message,
                })) || []
            );
        },
        add: async (key: FunctionEventKey, message: string) => {
            const now = new Date();
            await withErrorCheck(
                db.put({
                    TableName: table,
                    Item: {
                        ...toDynamoKey(key, now),
                        timestamp: now.toISOString(),
                        body: { message },
                        ttl: getTimeToLive(ttlMinutes),
                    },
                }),
                'Failed adding key'
            );

            log.trace({ key }, 'Retry record stored');
        },
    };
};
