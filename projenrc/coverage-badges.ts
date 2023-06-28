import { javascript } from "projen";
import { AwsCdkTypeScriptApp } from "projen/lib/awscdk";
import {
  CoverageBadgesBase,
  CoverageBadgesOptions,
} from "./coverage-badges-base";

export class CoverageBadges extends CoverageBadgesBase {
  constructor(project: AwsCdkTypeScriptApp, options?: CoverageBadgesOptions) {
    const updateCoverageReporters = (reqReporters: string[]) => {
      const jestConfig: javascript.JestConfigOptions = project.jest?.config;
      const existingReporters = jestConfig?.coverageReporters || [];
      const missingReporters = reqReporters.filter(
        (reporter) => !existingReporters.find((r) => r === reporter)
      );
      jestConfig?.coverageReporters?.push(...missingReporters); // assumes coverageReporters are initialised
    };

    super(project, "jest test --coverage", updateCoverageReporters, options);
  }
}
