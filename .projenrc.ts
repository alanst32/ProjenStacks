import { awscdk } from "projen";
import { CoverageBadges } from "./projenrc/coverage-badges";
import {
  cdkAppTsconfigPaths,
  tsconfigPathsToModuleNameMapper,
} from "./projenrc/projen-utils";
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  description:
    "Alan project exo" /* The description is just a string that helps people understand the purpose of the package. */,
  deps: [
    "axios-retry",
    "axios",
    "dayjs",
    "jsonwebtoken@^9.0.0",
    "lodash@^4.17.21",
    "openapi3-ts",
    "swagger-jsdoc",
    "uuid",
    "zod",
  ] /* Runtime dependencies of this module. */,
  devDeps: [
    "@types/jsonwebtoken@^9.0.1",
    "@types/lodash",
    "@types/swagger-jsdoc",
    "@types/uuid",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "axios-mock-adapter",
    "eslint-plugin-no-relative-import-paths",
    "jest-mock-extended@^2.0.6",
    "tsconfig-paths",
  ] /* Build dependencies for this module. */,
  eslintOptions: { dirs: ["src", "projenrc"], prettier: true },
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: [
          "feat",
          "fix",
          "chore",
          "docs",
          "style",
          "refactor",
          "perf",
          "test",
          "build",
          "ci",
          "revert",
        ],
      },
    },
    mergify: false,
  },
  jest: true,
  jestOptions: {
    jestConfig: {
      preset: "ts-jest",
      testEnvironment: "node",
      collectCoverage: true,
      testPathIgnorePatterns: [
        "<rootDir>/dist",
        "src/tests/integration",
        "__fixtures__",
      ],
      collectCoverageFrom: [
        "src/app/**/*.{js,ts}",
        "!src/app/**/index.{js,ts}",
      ],
      coverageReporters: ["json-summary", "text", "lcov"],
      roots: ["<rootDir>/src"],
      moduleDirectories: ["node_modules", "src"],
      moduleNameMapper: tsconfigPathsToModuleNameMapper(cdkAppTsconfigPaths, {
        prefix: "<rootDir>",
      }),
    },
  },
  name: "ProjenStacks",
  packageName: "ProjenStacks" /* The "name" in package.json. */,
  prettier: true,
  projenrcTs: true,
  repository: "git@github.com:alanst23/ProjenStacks.git",
});

project.gitignore.addPatterns(
  "cdk.context.json",
  ".idea",
  "*.iml",
  ".DS_Store",
  ".vscode/"
);

// eslint
project.eslint?.addPlugins("no-relative-import-paths");

project.eslint?.addRules({
  "import/no-extraneous-dependencies": [
    "error",
    {
      devDependencies: [
        "**/testing/**",
        "**/*.test.ts",
        "projenrc/**",
        "src/infra/**",
      ],
    },
  ],
});
project.eslint?.addRules({
  "import/order": [
    "error",
    {
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
      },
      "newlines-between": "always",
    },
  ],
});
project.eslint?.addOverride({
  files: ["*.test.ts", "projenrc/**/*", "src/infra/**/*", ".projenrc.ts"],
  rules: {
    "no-relative-import-paths/no-relative-import-paths": "off",
  },
});

const tsConfigs = [project.tsconfig, project.tsconfigDev];

tsConfigs.forEach((config) => {
  config?.file.addOverride("ts-node.require", ["tsconfig-paths/register"]);
  config?.file.addOverride("compilerOptions.baseUrl", ".");
  config?.file.addOverride("compilerOptions.lib", ["ES2020", "dom"]);
  config?.file.addOverride("compilerOptions.target", "ES2020");
  config?.file.addOverride("compilerOptions.paths", cdkAppTsconfigPaths);
});

// coverage
new CoverageBadges(project, { allowedBranches: ["dev"] });
project.synth();
