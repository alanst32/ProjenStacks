import { DependencyType, SourceCode, typescript } from 'projen';

export function configureDatadogJestEnvironment(project: typescript.TypeScriptProject) {
  if (project.jest) {
    try {
      project.deps.getDependency('dd-trace', DependencyType.DEVENV);
    } catch {
      project.addDevDeps('dd-trace');
    }
    project.testTask.env('NODE_OPTIONS', '$(if test "$CI" = "true"; then echo "-r dd-trace/ci/init"; fi)');
    project.testTask.env('DD_ENV', '$(if test "$CI" = "true"; then echo "ci"; fi)');
    project.testTask.env('DD_SERVICE', project.name);
    // Add gitignore patterns to prevent mutation caused by
    // https://github.com/DataDog/dd-trace-js/blob/master/packages/dd-trace/src/plugins/util/git.js#L92
    project.gitignore.addPatterns('*.idx', '*.pack');
  }
}
