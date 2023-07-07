/*
Environment configuration management, setting stacks for non prod and & prod enviroments
*/
import { EnvConfig } from './types';

const CEVO_SANDBOX = '590312749310';
const region = 'ap-southeast-2';
const domain = 'cevo-dev.ninja';

const nonProdStackConfig = (appEnv: string) => ({
  appEnv,
  awsEnv: { account: CEVO_SANDBOX, region },
  backupEnable: false,
  isProd: false,
  hostedZone: { id: 'Z0861021OA0JBAPE5NV6', name: `projen-stacks.${domain}` },
  certificateArn: 'arn:aws:acm:ap-southeast-2:590312749310:certificate/5ad4c38b-0d85-4e41-a851-1097f883b73a',
});

export const standardEnvs: EnvConfig[] = [
  {
    ...nonProdStackConfig('dev'),
  },
  // {
  //   appEnv: "production",
  //   awsEnv: { account: CEVO_SANDBOX, region },
  //   backupEnable: true,
  //   isProd: true,
  //   hostedZone: { id: 'TODO', name: `ps-projen-stacks-cevodev.com.au}` },
  // },
  // TODO test PR
];

export const getEnvConfigs = (): EnvConfig[] => {
  return [...standardEnvs];
};
