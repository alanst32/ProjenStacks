import { DynEventReceiptStore } from './receipt-store';

export const mockDocumentClientPut = jest.fn().mockImplementation((param: any) => ({
    promise: ((innerParam: any) => {
        switch (innerParam.Item.pk) {
            case 'event#conditional-error':
                return jest.fn().mockImplementation(async () => {
                    throw { code: 'ConditionalCheckFailedException' };
                });
            case 'event#other-error':
                return jest.fn().mockImplementation(async () => {
                    throw new Error('Other error');
                });
            default:
                return jest.fn().mockResolvedValue({ $response: { error: undefined } });
        }
    })(param),
}));

export const mockDocumentClientDelete = jest.fn().mockImplementation(() => ({
    promise: jest.fn().mockResolvedValue({ $response: { error: undefined } }),
}));

jest.mock('aws-sdk', () => ({
    ...jest.requireActual('aws-sdk'),
    DynamoDB: {
        DocumentClient: class {
            put = mockDocumentClientPut;
            delete = mockDocumentClientDelete;
        },
    },
}));

describe('Receipt Store', () => {
    const key = { id: '123', functionName: 'function-1' };
    const receiptStore = DynEventReceiptStore('my-table', 10);
    const now = new Date('2022-08-08');

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(now);
    });

    afterAll(() => jest.useRealTimers());

    describe('keep method', () => {
        it('stores receipt key when there is no exisiting primary key', async () => {
            await receiptStore.keep(key);
            expect(mockDocumentClientPut).toHaveBeenCalledWith({
                Item: {
                    pk: 'event#123',
                    sk: 'function#function-1#receipt',
                    timestamp: '2022-08-08T00:00:00.000Z',
                    ttl: now.getTime() / 1000 + 600,
                },
                TableName: 'my-table',
                ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
            });
        });

        it('throws ReceiptError when there is exisiting primary key', async () => {
            await expect(() => receiptStore.keep({ ...key, id: 'conditional-error' })).rejects.toThrow(
                /Receipt exists/
            );
            expect(mockDocumentClientPut).toHaveBeenCalledWith({
                Item: {
                    pk: 'event#conditional-error',
                    sk: 'function#function-1#receipt',
                    timestamp: '2022-08-08T00:00:00.000Z',
                    ttl: now.getTime() / 1000 + 600,
                },
                TableName: 'my-table',
                ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
            });
        });

        it('throws other error when other error occurs', async () => {
            await expect(() => receiptStore.keep({ ...key, id: 'other-error' })).rejects.toThrow(/Other error/);
            expect(mockDocumentClientPut).toHaveBeenCalledWith({
                Item: {
                    pk: 'event#other-error',
                    sk: 'function#function-1#receipt',
                    timestamp: '2022-08-08T00:00:00.000Z',
                    ttl: now.getTime() / 1000 + 600,
                },
                TableName: 'my-table',
                ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
            });
        });
    });

    describe('remove method', () => {
        it('calls delete method of document client with correct data', async () => {
            await receiptStore.remove(key);
            expect(mockDocumentClientDelete).toHaveBeenCalledWith({
                Key: {
                    pk: 'event#123',
                    sk: 'function#function-1#receipt',
                },
                TableName: 'my-table',
            });
        });
    });
});
