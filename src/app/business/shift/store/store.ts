import { DynamoDB } from 'aws-sdk';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { DefaultReducer, Reduce } from './reducer';
import { ShiftStore } from './types';
import { QueryAll } from './utils';
import { ShiftRequest, Shift } from '../model/model.';

export const DynamoShiftStore = (props: { table?: string; ttlDays?: number }): ShiftStore => {
  const tableName = props?.table ?? process.env.TABLE_NAME;
  if (!tableName) throw new Error('No table name given or missing TABLE_NAME');

  const getShiftPk = (id: string) => `shift#${id}`;
  const getShiftSk = () => `shift`;

  const documentClient = new DynamoDB.DocumentClient();
  const queryAll = QueryAll(documentClient);
  const reducer = DefaultReducer();
  const reduce = Reduce({ reducer });

  const ttlDays = parseInt((props?.ttlDays || process.env.DYNAMO_TTL_DAYS) as string) || undefined;

  const saveShift = async (shift: ShiftRequest) => {
    const now = dayjs();
    now.format();
    const id = uuidv4();

    const putItem = {
      pk: getShiftPk(id),
      sk: getShiftSk(),
      shift_id: id,
      timestamp: now.toString(), // Requires UTC plugin to work
      ttl: ttlDays || undefined,
      statusEvents: {
        status: 'CREATED',
        createdAt: now.toString(),
      },
      body: { ...shift },
    };

    const res = await documentClient
      .put({
        TableName: tableName,
        Item: putItem,
      })
      .promise();

    if (res?.$response.error) throw new Error(res.$response.error.message);
  };

  const getShiftById = async (id: string): Promise<Shift | undefined> => {
    const records = await queryAll({
      TableName: tableName,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeValues: { ':pk': getShiftPk(id) },
      ExpressionAttributeNames: { '#pk': 'pk' },
    });
    return reduce(records);
  };

  return {
    getShiftById,
    saveShift,
  };
};
