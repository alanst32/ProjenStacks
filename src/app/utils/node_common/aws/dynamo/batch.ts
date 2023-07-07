import { DynamoDB as Dyn } from 'aws-sdk';
import { chunk } from '../../collection/chunk';
import { withErrorCheck } from '../utils';

/**
 * Recursively query all items in database.
 * @param db The DocumentClient instance
 * @returns The item list.
 */
export const QueryAll = (db: Dyn.DocumentClient) => {
  return async (queryInput: Dyn.DocumentClient.QueryInput, maxPageCount = 50): Promise<Dyn.DocumentClient.ItemList> => {
    let itemList: Dyn.DocumentClient.ItemList = [];
    let pageCount = 0;

    const loadBatch = async (query: Dyn.DocumentClient.QueryInput) => {
      const result = await withErrorCheck(db.query(query));
      const { Items, LastEvaluatedKey } = result;
      pageCount++;

      if (Items) itemList = itemList.concat(Items);

      if (LastEvaluatedKey && pageCount < maxPageCount) {
        query.ExclusiveStartKey = LastEvaluatedKey;
        await loadBatch(query);
      }
    };

    await loadBatch(queryInput);
    return itemList;
  };
};

/**
 * Delete all records in batch.
 * @param table Table name
 * @param db The DocumentClient instance
 * @returns void
 */
export const BatchDeleteAll = (table: string, db: Dyn.DocumentClient) => {
  return async (keys: { pk: string; sk: string }[]) => {
    const keyChunks = chunk(keys, 25);

    for (const keyChunk of keyChunks) {
      await withErrorCheck(
        db.batchWrite({
          RequestItems: {
            [table]: keyChunk.map(key => ({
              DeleteRequest: { Key: key },
            })),
          },
        }),
        'Failed batch deleting'
      );
    }
  };
};

/**
 * Recursively call BatchGetItem to get all matching DynamoDB records
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html
 *
 * @param db DynamoDB Document Client
 * @returns BatchGetResponseMap - key-value pairs, keys are the table names, values are the ItemList
 */
export const BatchGetAll = (db: Dyn.DocumentClient) => {
  return async (input: Dyn.DocumentClient.BatchGetItemInput): Promise<Dyn.DocumentClient.BatchGetResponseMap> => {
    let allResponses: Dyn.DocumentClient.BatchGetResponseMap = {};

    const loadBatch = async (batchGetInput: Dyn.DocumentClient.BatchGetItemInput) => {
      const { Responses, UnprocessedKeys } = await withErrorCheck(db.batchGet(batchGetInput));

      if (Responses) {
        for (const [key, value] of Object.entries(Responses)) {
          if (allResponses[key]) {
            allResponses[key] = [...allResponses[key], ...value];
          } else {
            allResponses[key] = value;
          }
        }
      }

      if (UnprocessedKeys && Object.keys(UnprocessedKeys).length) {
        batchGetInput.RequestItems = UnprocessedKeys;
        await loadBatch(batchGetInput);
      }
    };

    await loadBatch(input);
    return allResponses;
  };
};
