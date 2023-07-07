import { CloudWatch } from 'aws-sdk';
import { log } from '../../log';

export type ServiceMetricProps = {
  namespace: string;
  envVarName: string;
  condition?: () => boolean;
};

/**
 * Returns service metric publishing helper.
 * @param props {@link ServiceMetricProps}
 * @returns ServiceMetric instance.
 */
export const ServiceMetric = <T extends string>(props: ServiceMetricProps) => {
  const env = process.env[props.envVarName] || `MISSING:${props.envVarName}`;
  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME || 'MISSING:AWS_LAMBDA_FUNCTION_NAME';
  const { namespace, condition } = props;
  const cw = new CloudWatch();

  return (metricName: T) => ({
    publish: async (value = 1, unit = 'Count') => {
      if (condition && !condition()) {
        return log.debug({ ...props, metricName }, 'Publish condition not met');
      }

      const res = await cw
        .putMetricData({
          MetricData: [
            {
              MetricName: metricName,
              Dimensions: [
                { Name: 'env', Value: env },
                { Name: 'function', Value: functionName },
              ],
              Unit: unit,
              Value: value,
            },
          ],
          Namespace: namespace,
        })
        .promise();

      if (res.$response.error) {
        return log.warn({ env, functionName, unit, value }, `Failed publishing metric: ${res.$response.error.message}`);
      }

      log.info({ env, functionName, unit, value }, 'Published CW metric');
    },
  });
};
