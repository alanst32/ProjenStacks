export const mockSqsSendMessage = jest.fn().mockImplementation(() => ({
  promise: jest.fn().mockResolvedValue({ $response: { error: undefined } }),
}));

jest.mock('aws-sdk', () => ({
  SQS: class {
    sendMessage = mockSqsSendMessage;
  },
}));
