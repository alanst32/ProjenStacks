import { App } from "aws-cdk-lib";

import { getEnvConfigs } from "./infra/config";
import { ProjenStacks } from "./infra/projen-stacks";
import { getStackName } from "./infra/utils/utils";

const app = new App();

getEnvConfigs().forEach((envConfig) => {
  const stackId = getStackName(envConfig.appEnv);
  new ProjenStacks(app, stackId, { envConfig });
});

app.synth();
