import { DynFailureStore } from './failure-store';

export const mockDocumentClientPut = jest.fn().mockImplementation((param: any) => ({
    promise: ((innerParam: any) => {
        switch (innerParam.Item.pk) {
            default:
                return jest.fn().mockResolvedValue({ $response: { error: undefined } });
        }
    })(param),
}));

export const mockDocumentClientQuery = jest.fn().mockImplementation(() => ({
    promise: jest.fn().mockResolvedValue({
        Items: [
            {
                body: { message: 'some-error' },
                pk: 'event#123',
                sk: 'function#function-1#failure#1659916800000',
                timestamp: '2022-08-08T00:00:00.000Z',
                ttl: 1659917400,
            },
        ],
        $response: { error: undefined },
    }),
}));

jest.mock('aws-sdk', () => ({
    ...jest.requireActual('aws-sdk'),
    DynamoDB: {
        DocumentClient: class {
            put = mockDocumentClientPut;
            query = mockDocumentClientQuery;
        },
    },
}));

describe('Failure Store', () => {
    const key = { id: '123', functionName: 'function-1' };
    const failureStore = DynFailureStore('my-table', 10);
    const now = new Date('2022-08-08');

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(now);
    });

    afterAll(() => jest.useRealTimers());

    describe('add method', () => {
        it('calls document client put method with correct data', async () => {
            await failureStore.add(key, 'some-error');
            expect(mockDocumentClientPut).toHaveBeenCalledWith({
                Item: {
                    body: { message: 'some-error' },
                    pk: 'event#123',
                    sk: 'function#function-1#failure#1659916800000',
                    timestamp: '2022-08-08T00:00:00.000Z',
                    ttl: 1659917400,
                },
                TableName: 'my-table',
            });
        });
    });

    describe('query method', () => {
        it('returns an array of failures', async () => {
            const res = await failureStore.get(key);

            expect(mockDocumentClientQuery).toHaveBeenCalledWith({
                ExpressionAttributeNames: {
                    '#pk': 'pk',
                    '#sk': 'sk',
                },
                ExpressionAttributeValues: {
                    ':pk': 'event#123',
                    ':sk': 'function#function-1#failure#',
                },
                KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
                TableName: 'my-table',
            });

            expect(res).toEqual([{ message: 'some-error', timestamp: '2022-08-08T00:00:00.000Z' }]);
        });
    });
});
