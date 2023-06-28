import { EnvConfig } from "./types";

/*
Environment configuration management, setting stacks for non prod and & prod enviroments
*/

const AWS_ACCOUNT = "590312749310";
const region = "ap-southeast-2";

const nonProdStackConfig = (appEnv: string) => ({
  appEnv,
  awsEnv: { account: CEVO_SANDBOX, region },
  backupEnable: false,
  apiDomain: "se-dev.api.testdomaincevo.com.au",
  isProd: false,
  zoneName: "testdomaincevo.com.au",
  zoneIde: "Z02092162696BT9GS13PB",
});

export const standardEnvs: EnvConfig[] = [
  {
    ...nonProdStackConfig("dev"),
  },
  // {
  //   appEnv: "production",
  //   awsEnv: { account: CEVO_SANDBOX, region },
  //   backupEnable: true,
  //   isProd: true,
  // },
];

export const getEnvConfigs = (): EnvConfig[] => {
  return [...standardEnvs];
};
