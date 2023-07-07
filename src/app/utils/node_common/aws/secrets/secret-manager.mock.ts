export const mockGetSecretValue = jest.fn();

jest.mock('aws-sdk', () => ({
  ...jest.requireActual('aws-sdk'),
  SecretsManager: class {
    getSecretValue() {
      return { promise: mockGetSecretValue };
    }
  },
}));
