import { Environment } from 'aws-cdk-lib';

export type EnvConfig = {
  appEnv: string;
  awsEnv: Environment;
  backupEnable: boolean;
  isProd?: boolean;
  hostedZone: { id: string; name: string };
  certificateArn: string;
};
