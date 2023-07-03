/* eslint-disable  @typescript-eslint/no-require-imports */
const { name: projectName } = require('../../../package.json');

export const isProdEnv = (envPrefix: string): boolean => {
  return ['prod', 'production'].includes(envPrefix.toLowerCase());
};
export const getStackName = (appEnv: string) => `${appEnv}-${projectName}`;
export const restApiSubDomainName = (appEnv: string) => (isProdEnv(appEnv) ? 'api' : `${appEnv}-api`);
export const restApiDomainName = (zoneName: string, appEnv: string) => `${restApiSubDomainName(appEnv)}.${zoneName}`;
