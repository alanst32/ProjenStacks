import { AWSError, Response, DynamoDB as Dyn } from 'aws-sdk';
import { BatchDeleteAll, BatchGetAll, QueryAll } from './batch';

const FakeDocumentClient = (pageCount = 5) => {
  const db = new Dyn.DocumentClient();
  let attempt = 0;

  const getData = (page: number): Dyn.DocumentClient.ItemList => {
    const char = String.fromCharCode(page + 96);
    return [{ val: char }];
  };

  return {
    ...db,
    query: (_input?: any) => {
      attempt++;
      return {
        promise: () =>
          Promise.resolve({
            Items: getData(attempt),
            LastEvaluatedKey: attempt < pageCount ? { key: '123' } : undefined,
            $response: {} as unknown as Response<Dyn.DocumentClient.QueryOutput, AWSError>,
          }),
      };
    },

    batchWrite: jest.fn().mockImplementation((_params: Dyn.DocumentClient.BatchWriteItemInput) => ({
      promise: () => ({ $response: { error: undefined } }),
    })),

    batchGet: (input: Dyn.DocumentClient.BatchGetItemInput) => {
      let result = { Responses: {}, UnprocessedKeys: {} };
      const items = Object.entries(input.RequestItems);

      if (items.length) {
        const [nextItem, ...restItems] = items;
        const [table, { Keys }] = nextItem;
        const [nextKey, ...restKeys] = Keys;

        result = {
          Responses: {
            [table]: [{ ...nextKey }],
          },
          UnprocessedKeys: {
            ...(restKeys.length ? { [table]: { Keys: restKeys } } : {}),
            ...Object.fromEntries(restItems || []),
          },
        };
      }
      return { promise: () => Promise.resolve(result) };
    },
  } as any as Dyn.DocumentClient;
};

describe('Dynamo query', () => {
  describe('QueryAll', () => {
    it('returns all records', async () => {
      const db = FakeDocumentClient();
      const queryAll = QueryAll(db);
      const res = await queryAll({} as Dyn.DocumentClient.QueryInput);
      expect(res).toEqual([{ val: 'a' }, { val: 'b' }, { val: 'c' }, { val: 'd' }, { val: 'e' }]);
    });

    it('returns records limited by page count', async () => {
      const db = FakeDocumentClient();
      const queryAll = QueryAll(db);
      const res = await queryAll({} as Dyn.DocumentClient.QueryInput, 1);
      expect(res).toEqual([{ val: 'a' }]);
    });
  });

  describe('BatchDeleteAll', () => {
    const db = FakeDocumentClient();

    it('batch deletes records split into 25-item chunk', async () => {
      const keys = Array(72)
        .fill(0)
        .map((_, i) => ({ pk: 'item#abc', sk: `part#${i + 1}` }));
      const batchDeleteAll = BatchDeleteAll('my-table', db);
      await batchDeleteAll(keys);
      expect(db.batchWrite).toHaveBeenCalledTimes(3);
    });
  });

  describe('BatchGetAll', () => {
    it('recursively gets all records', async () => {
      const db = FakeDocumentClient();

      const batchGetAll = BatchGetAll(db);
      const res = await batchGetAll({
        RequestItems: {
          tableA: { Keys: [{ pk: 'pk1' }, { pk: 'pk2' }] },
          tableB: { Keys: [{ pk: 'pk3' }, { pk: 'pk4' }] },
        },
      });
      expect(res).toEqual({
        tableA: [{ pk: 'pk1' }, { pk: 'pk2' }],
        tableB: [{ pk: 'pk3' }, { pk: 'pk4' }],
      });
    });
  });
});
