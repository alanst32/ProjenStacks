const { typescript } = require('projen');
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'ProjenStacks',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */

  // repository: ''
});

// Git Ignore
project.gitignore.addPatterns('cdk.context.json', '.idea', '*.iml', '.DS_Store', '.vscode/');

// eslint
project.eslint?.addPlugins('no-relative-import-paths');
project.eslint?.addRules({
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: ['**/testing/**', '**/*.test.ts', 'projenrc/**', 'src/infra/**'],
    },
  ],
});

project.eslint?.addRules({
  'import/order': [
    'error',
    {
      'alphabetize': {
        order: 'asc',
        caseInsensitive: true,
      },
      'newlines-between': 'always',
    },
  ],
});

project.eslint?.addOverride({
  files: ['*.test.ts', 'projenrc/**/*', 'src/infra/**/*', '.projenrc.ts'],
  rules: {
    'no-relative-import-paths/no-relative-import-paths': 'off',
  },
});

// TS Config
const tsConfigs = [project.tsconfig, project.tsconfigDev];
tsConfigs.forEach((config) => {
  config?.file.addOverride('ts-node.require', ['tsconfig-paths/register']);
  config?.file.addOverride('compilerOptions.baseUrl', '.');
  config?.file.addOverride('compilerOptions.lib', ['ES2020', 'dom']);
  config?.file.addOverride('compilerOptions.target', 'ES2020');
  config?.file.addOverride('compilerOptions.paths', cdkAppTsconfigPaths);
});

project.synth();