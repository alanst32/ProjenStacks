export const mockSnsPublish = jest.fn().mockImplementation(() => ({
  promise: jest.fn().mockResolvedValue({ $response: { error: undefined } }),
}));

jest.mock('aws-sdk', () => ({
  ...jest.requireActual('aws-sdk'),
  SNS: class {
    publish = mockSnsPublish;
  },
}));
