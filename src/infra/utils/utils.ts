/* eslint-disable  @typescript-eslint/no-require-imports */
const { name: projectName } = require("../../../package.json");

export const getStackName = (appEnv: string) => `se-${appEnv}-${projectName}`;
export const getDomainStackName = (appEnv: string) => `se-${appEnv}-domain`;
