import { withErrorCheck } from './utils';

describe('AWS utils', () => {
  const fakeS3 = {
    getObject: (..._params: any) => ({
      promise: () => ({ $response: { error: new Error('some-error') } } as any),
    }),
  };

  it('checks AWS client operation for error', async () => {
    await expect(() => withErrorCheck(fakeS3.getObject({ Bucket: 'my-bucket', Key: 'my-key' }))).rejects.toThrow(
      'some-error'
    );
  });
});
