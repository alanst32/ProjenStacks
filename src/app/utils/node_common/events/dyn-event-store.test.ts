import { DynEventStore } from './dyn-event-store';
import { Event } from './types';

const mockDocumentClientPut = jest.fn().mockImplementation((param: any) => ({
  promise: ((innerParam: any) => {
    switch (innerParam.Item.pk) {
      default:
        return jest.fn().mockResolvedValue({ $response: { error: undefined } });
    }
  })(param),
}));

const entity = { id: '123', type: 'paper' };

const eventRecord = {
  payload: { title: 'Paper Title' },
  type: 'paper:created',
  id: 'event-id',
  entity_id: '123',
  entity_type: 'paper',
  pk: 'paper#123',
  sk: 'event#event-id',
  timestamp: '2022-08-08T00:00:00.000Z',
  ttl: 1659917400,
};

const mockDocumentClientQuery = jest.fn().mockImplementation(args => ({
  promise: jest.fn().mockResolvedValue({
    Items: args.ExpressionAttributeValues[':pk'] === 'paper#123' ? [eventRecord] : undefined,
    $response: { error: undefined },
  }),
}));

const mockDocumentClientBatchWrite = jest.fn().mockImplementation(() => ({
  promise: jest.fn().mockResolvedValue({
    $response: { error: undefined },
  }),
}));

jest.mock('aws-sdk', () => ({
  ...jest.requireActual('aws-sdk'),
  DynamoDB: {
    DocumentClient: class {
      put = mockDocumentClientPut;
      query = mockDocumentClientQuery;
      batchWrite = mockDocumentClientBatchWrite;
    },
  },
}));

describe('Event Store', () => {
  const now = new Date('2022-08-08');
  const mockDispatch = jest.fn();

  const eventStore = DynEventStore({
    table: 'my-table',
    dispatcher: { dispatch: mockDispatch },
  });

  const event: Event = {
    entity,
    payload: { title: 'Paper Title' },
    type: 'paper:created',
  };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterAll(() => jest.useRealTimers());

  describe('publish method', () => {
    it('calls document client put method with correct data', async () => {
      await eventStore.publish(event);

      expect(mockDocumentClientPut).toHaveBeenCalledWith({
        Item: {
          id: expect.stringMatching(/\S{21}/),
          type: 'paper:created',
          entity_id: '123',
          entity_type: 'paper',
          payload: { title: 'Paper Title' },
          pk: 'paper#123',
          sk: expect.stringMatching(/event#\S{21}/),
          timestamp: '2022-08-08T00:00:00.000Z',
        },
        TableName: 'my-table',
      });

      expect(mockDispatch).toBeCalledWith({
        entity: { id: '123', type: 'paper' },
        id: expect.stringMatching(/\S{21}/),
        payload: { title: 'Paper Title' },
        timestamp: '2022-08-08T00:00:00.000Z',
        type: 'paper:created',
      });
    });

    it('calls document client put method with correct data and does not publish when silent flag is true', async () => {
      await eventStore.record(event);

      expect(mockDocumentClientPut).toHaveBeenCalledWith({
        Item: {
          id: expect.stringMatching(/\S{21}/),
          type: 'paper:created',
          entity_id: '123',
          entity_type: 'paper',
          payload: { title: 'Paper Title' },
          pk: 'paper#123',
          sk: expect.stringMatching(/event#\S{21}/),
          timestamp: '2022-08-08T00:00:00.000Z',
        },
        TableName: 'my-table',
      });

      expect(mockDispatch).not.toBeCalled();
    });
  });

  describe('load method', () => {
    it('returns empty array when no events found', async () => {
      const res = await eventStore.load({ id: '333', type: 'paper' });

      expect(mockDocumentClientQuery).toHaveBeenCalledWith({
        ExpressionAttributeNames: { '#pk': 'pk' },
        ExpressionAttributeValues: { ':pk': 'paper#333' },
        KeyConditionExpression: '#pk = :pk',
        TableName: 'my-table',
      });

      expect(res).toEqual([]);
    });

    it('returns an array of events', async () => {
      const res = await eventStore.load(entity);

      expect(mockDocumentClientQuery).toHaveBeenCalledWith({
        ExpressionAttributeNames: { '#pk': 'pk' },
        ExpressionAttributeValues: { ':pk': 'paper#123' },
        KeyConditionExpression: '#pk = :pk',
        TableName: 'my-table',
      });

      expect(res).toEqual([
        {
          ...event,
          id: 'event-id',
          timestamp: '2022-08-08T00:00:00.000Z',
        },
      ]);
    });

    it('throws when querying by event type but eventIndexName is not supplied', async () => {
      const myEventStore = DynEventStore({
        table: 'my-table',
        dispatcher: { dispatch: mockDispatch },
      });

      await expect(() => myEventStore.load(entity, { eventType: 'paper:created' })).rejects.toThrow(
        /Querying by event type/
      );

      expect(mockDocumentClientQuery).not.toBeCalled();
    });

    it('includes event type in condition expression when querying by event type', async () => {
      const myEventStore = DynEventStore({
        table: 'my-table',
        dispatcher: { dispatch: mockDispatch },
        entityEventIndexName: 'entity-event-index-name',
      });

      await myEventStore.load(entity, { eventType: 'paper:created', ascending: true, limit: 2 });

      expect(mockDocumentClientQuery).toBeCalledWith({
        ExpressionAttributeNames: { '#pk': 'pk', '#type': 'type' },
        ExpressionAttributeValues: { ':pk': 'paper#123', ':type': 'paper:created' },
        IndexName: 'entity-event-index-name',
        KeyConditionExpression: '#pk = :pk AND #type = :type',
        Limit: 2,
        ScanIndexForward: true,
        TableName: 'my-table',
      });
    });
  });

  describe('remove method', () => {
    it('calls remove method', async () => {
      await eventStore.remove(entity);

      expect(mockDocumentClientQuery).toHaveBeenCalledWith({
        ExpressionAttributeNames: { '#pk': 'pk' },
        ExpressionAttributeValues: { ':pk': 'paper#123' },
        KeyConditionExpression: '#pk = :pk',
        TableName: 'my-table',
      });

      expect(mockDocumentClientBatchWrite).toHaveBeenCalledWith({
        RequestItems: {
          'my-table': [
            {
              DeleteRequest: {
                Key: { pk: 'paper#123', sk: 'event#event-id' },
              },
            },
          ],
        },
      });
    });
  });
});
