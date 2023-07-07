export const mockBridgePutEvents = jest.fn().mockImplementation(() => ({
    promise: jest.fn().mockResolvedValue({ $response: { error: undefined } }),
}));

jest.mock('aws-sdk', () => ({
    EventBridge: class {
        putEvents = mockBridgePutEvents;
    },
}));
