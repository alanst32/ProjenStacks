import { DynEventScheduleStore } from './dyn-event-schedule-store';

export const mockDocumentClientPut = jest.fn().mockImplementation((param: any) => ({
  promise: ((innerParam: any) => {
    switch (innerParam.Item.pk) {
      default:
        return jest.fn().mockResolvedValue({ $response: { error: undefined } });
    }
  })(param),
}));

jest.mock('aws-sdk', () => ({
  ...jest.requireActual('aws-sdk'),
  DynamoDB: {
    DocumentClient: class {
      put = mockDocumentClientPut;
    },
  },
}));

describe('Event Schedule Store', () => {
  const scheduleStore = DynEventScheduleStore('my-table');
  const now = new Date('2022-08-08');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  describe('add', () => {
    it('calls document client put method with correct data', async () => {
      await scheduleStore.add({
        minutesLater: 10,
        event: {
          entity: { id: '123', type: 'document' },
          type: 'document:tested',
          payload: { abc: '123' },
        },
      });

      expect(mockDocumentClientPut).toHaveBeenCalledWith({
        Item: {
          event: {
            entity: { id: '123', type: 'document' },
            payload: { abc: '123' },
            type: 'document:tested',
          },
          pk: expect.stringMatching(/schedule#\S{21}/),
          sk: 'event',
          ttl: Math.floor(now.getTime() / 1000) + 600,
        },
        TableName: 'my-table',
      });
    });
  });

  describe('remove', () => {
    it('throws when invoked', async () => {
      await expect(scheduleStore.remove('123')).rejects.toThrow('not available');
    });
  });
});
