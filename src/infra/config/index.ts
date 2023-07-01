/*
Environment configuration management, setting stacks for non prod and & prod enviroments
*/

import { EnvConfig } from "./types";

const CEVO_SANDBOX = "590312749310";
const region = "ap-southeast-2";

const nonProdStackConfig = (appEnv: string) => ({
  appEnv,
  awsEnv: { account: CEVO_SANDBOX, region },
  backupEnable: false,
  apiDomain: "se-dev.api.testdomaincevo.com.au",
  isProd: false,
  zoneId: "Z02092162696BT9GS13PB",
  zoneName: "testdomaincevo.com.au",
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

export const getSubdomain = (appEnv: string, subdomain: string) => {
  if (appEnv === "production") return subdomain;
  else return `${appEnv}-${subdomain}`;
};
