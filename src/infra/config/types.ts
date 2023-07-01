import { Environment } from "aws-cdk-lib";

export type EnvConfig = {
  apiDomain: string;
  appEnv: string;
  awsEnv: Environment;
  backupEnable: boolean;
  isProd?: boolean;
  zoneId: string;
  zoneName: string;
};
