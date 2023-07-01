import { awscdk } from 'projen';
import { ArrowParens, QuoteProps, TrailingComma } from 'projen/lib/javascript';

import { CommitLint } from './projenrc/commit-lint/commitLint';
import { CoverageBadges } from './projenrc/coverage-badge/coverage-badges';
import { Husky } from './projenrc/husky/husky';

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  description:
    'Alan project exo' /* The description is just a string that helps people understand the purpose of the package. */,
  deps: [
    'aws-lambda',
    'axios-retry',
    'axios',
    'dayjs',
    'jsonwebtoken@^9.0.0',
    'lodash@^4.17.21',
    'openapi3-ts',
    'swagger-jsdoc',
    'uuid',
    'zod',
  ] /* Runtime dependencies of this module. */,
  devDeps: [
    '@types/jsonwebtoken@^9.0.1',
    '@types/lodash',
    '@types/swagger-jsdoc',
    '@types/uuid',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    '@types/aws-lambda',
    'axios-mock-adapter',
    'eslint-plugin-no-relative-import-paths',
    'jest-mock-extended@^2.0.6',
    'jest-mock-process@^2.0.0',
    'tsconfig-paths',
    'aws-sdk@^2.1249.0',
    'ts-jest@^27',
  ] /* Build dependencies for this module. */,
  eslintOptions: {
    dirs: ['src', 'projenrc'],
    devdirs: ['test'],
    // aliasMap: {
    //   '@app': './src/app',
    //   '@infra': './src/infra',
    //   '@test': './test',
    // },
    aliasExtensions: ['.ts', '.tsx', '.json', '.js', '.jsx'],
    prettier: true,
  },
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'revert'],
      },
    },
    mergify: false,
  },
  jest: true,
  jestOptions: {
    jestConfig: {
      preset: 'ts-jest',
      testEnvironment: 'node',
      collectCoverage: true,
      testPathIgnorePatterns: ['<rootDir>/dist', 'src/tests/integration', '__fixtures__'],
      collectCoverageFrom: ['src/app/**/*.{js,ts}', '!src/app/**/index.{js,ts}'],
      coverageReporters: ['json-summary', 'text', 'lcov'],
      roots: ['<rootDir>/src'],
      moduleDirectories: ['node_modules', 'src'],
    },
  },
  name: 'ProjenStacks',
  packageName: 'ProjenStacks' /* The "name" in package.json. */,
  prettier: true,
  prettierOptions: {
    settings: {
      printWidth: 120,
      tabWidth: 2,
      singleQuote: true,
      semi: true,
      trailingComma: TrailingComma.ES5,
      arrowParens: ArrowParens.AVOID,
      quoteProps: QuoteProps.ASNEEDED,
    },
  },
  projenrcTs: true,
  repository: 'git@github.com:alanst23/ProjenStacks.git',
  tsconfig: {
    compilerOptions: {
      baseUrl: '.',
      rootDir: '.',
      // paths: {
      //   '@/app/*': ['./src/app/*'],
      //   '@/infra/*': ['./src.infra/*'],
      //   '@test/*': ['./src/test/*'],
      // },
    },
  },
});

project.addDeps('@brokerloop/ttlcache', 'nanoid@^3', 'retry-as-promised', 'ulid');
project.addDevDeps('msw@^1.2.2', 'typedoc@^0.24.4');

// GIT IGNORE
project.gitignore.addPatterns('cdk.context.json', '.idea', '*.iml', '.DS_Store', '.vscode/');

// ESLINT
project.eslint?.addPlugins('no-relative-import-paths');

project.eslint!.addRules({
  'import/no-extraneous-dependencies': 'off',
  'no-restricted-exports': ['error', { restrictDefaultExports: { direct: true } }],
});

project.eslint?.addOverride({
  files: ['*.test.ts', 'projenrc/**/*', 'src/infra/**/*', '.projenrc.ts'],
  rules: {
    'no-relative-import-paths/no-relative-import-paths': 'off',
  },
});

// TS CONFIG
const tsConfigs = [project.tsconfig, project.tsconfigDev];
tsConfigs.forEach(config => {
  config?.file.addOverride('ts-node.require', ['tsconfig-paths/register']);
  config?.file.addOverride('compilerOptions.baseUrl', '.');
  config?.file.addOverride('compilerOptions.lib', ['ES2020', 'dom']);
  config?.file.addOverride('compilerOptions.target', 'ES2020');
});

// Coverage Badges on GitHub
new CoverageBadges(project, { allowedBranches: ['dev'] });
// CommitLint
new CommitLint(project);
// Husky
new Husky(project);

// TODO fix, not necessary anymore
// if (project.deps.tryGetDependency('aws-lambda', DependencyType.RUNTIME) === undefined) {
//   project.addDeps('aws-lambda');
//   project.addDevDeps('@types/aws-lambda');
// }

project.addTask;

project.synth();
