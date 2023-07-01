import { assign } from 'lodash';
import { Component, javascript } from 'projen';

/**
 * https://github.com/conventional-changelog/commitlint
 */
export class CommitLint extends Component {
  readonly commitLintConfig: Record<string, any>;

  constructor(project: javascript.NodeProject) {
    super(project);

    project.addDevDeps('@commitlint/cli', '@commitlint/config-conventional', 'cz-conventional-changelog', 'commitizen');

    this.commitLintConfig = {
      extends: ['@commitlint/config-conventional'],
      rules: {
        'scope-case': [2, 'always', 'pascal-case'],
        'header-max-length': [2, 'always', 100],
        'subject-case': [2, 'always', ['sentence-case', 'lower-case']],
      },
    };

    project.addFields({
      commitlint: this.commitLintConfig,
      config: {
        commitizen: {
          path: './node_modules/cz-conventional-changelog',
          disableScopeLowerCase: true,
          disableSubjectLowerCase: true,
        },
      },
    });

    project.setScript('commit', 'git-cz');
    project.setScript('commitlint', 'commitlint');
  }

  /**
   * Override commitlint config
   *
   * Here is an example of how we can add pre commit hooks
   * ```ts
   * overrideCommitlint({
   *   rules: {
   *      'header-max-length': [2, 'always', 36]
   *   }
   * })
   * ```
   * @param commitlint commitlint config
   */
  public overrideCommitlint(commitlint: Record<string, any>) {
    assign(this.commitLintConfig, commitlint);
  }
}
