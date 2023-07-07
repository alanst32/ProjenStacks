/* eslint-disable import/order */
import { mockLog } from '../../log/log.mock';
import { ServiceMetric } from './metric';

export const mockPutMetricData = jest.fn().mockImplementation(args => ({
  promise: () =>
    Promise.resolve({
      $response: {
        error: args.MetricData[0].Value > 1 ? { message: 'Fake error' } : undefined,
      },
    }),
}));

jest.mock('aws-sdk', () => ({
  CloudWatch: class {
    putMetricData = (args: any) => mockPutMetricData(args);
  },
}));

enum TestMetric {
  A = 'a',
  B = 'b',
}

describe('AWS Cloudwatch metric tests', () => {
  const now = new Date();

  afterAll(() => jest.useRealTimers());

  it('does not publish metric data when condition is false', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    const BlcMetric = ServiceMetric<TestMetric>({
      envVarName: 'ENV',
      namespace: 'BLC',
      condition: () => false,
    });

    const aBlcMetric = BlcMetric(TestMetric.A);
    await aBlcMetric.publish();
    expect(mockPutMetricData).not.toHaveBeenCalled();
  });

  it('publishes metric data when condition is true', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
    const BlcMetric = ServiceMetric<TestMetric>({
      envVarName: 'ENV',
      namespace: 'BLC',
      condition: () => true,
    });

    const aBlcMetric = BlcMetric(TestMetric.A);
    await aBlcMetric.publish();

    expect(mockPutMetricData).toBeCalledWith({
      MetricData: [
        {
          MetricName: TestMetric.A,
          Dimensions: [
            { Name: 'env', Value: 'MISSING:ENV' },
            { Name: 'function', Value: 'MISSING:AWS_LAMBDA_FUNCTION_NAME' },
          ],
          Unit: 'Count',
          Value: 1,
        },
      ],
      Namespace: 'BLC',
    });
  });

  it('logs warning for failed publishing', async () => {
    const BlcMetric = ServiceMetric<TestMetric>({
      envVarName: 'ENV',
      namespace: 'BLC',
      condition: () => true,
    });

    const aBlcMetric = BlcMetric(TestMetric.A);
    await aBlcMetric.publish(2); // returns fake error
    expect(mockLog.warn).toBeCalledWith(
      { env: 'MISSING:ENV', functionName: 'MISSING:AWS_LAMBDA_FUNCTION_NAME', unit: 'Count', value: 2 },
      'Failed publishing metric: Fake error'
    );
  });
});
