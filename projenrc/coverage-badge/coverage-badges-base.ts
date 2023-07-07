/* eslint-disable no-template-curly-in-string */

import { Component, github, javascript } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';

export interface CoverageBadgesOptions {
  allowedBranches: string[];
}

export class CoverageBadgesBase extends Component {
  public readonly allowedBranches: string[];

  constructor(
    project: javascript.NodeProject,
    coverageCommand: string,
    updateJestReporters: (reporters: string[]) => void,
    options?: CoverageBadgesOptions
  ) {
    super(project);
    this.allowedBranches = options?.allowedBranches || ['main'];

    project.tasks.addTask('coverage', {
      exec: coverageCommand,
    });

    updateJestReporters(['json-summary', 'lcov', 'text']);
    this._createWorkflow();
  }

  private _createWorkflow(): void {
    const project = this.project as javascript.NodeProject;
    if (!project.github) return;

    const workflow = new github.GithubWorkflow(project.github!, 'coverage-badges');
    workflow.on({ push: { branches: this.allowedBranches } });

    workflow.addJob('generate-coverage-badges', {
      runsOn: ['ubuntu-latest'],
      permissions: { contents: JobPermission.WRITE },
      steps: [
        {
          name: 'extract branch used',
          id: 'extract_branch',
          run: 'echo ::set-output name=branch::${GITHUB_REF#refs/*/}',
        },
        {
          name: 'checkout source',
          uses: 'actions/checkout@v2',
          with: {
            path: './source',
          },
        },
        {
          name: 'npm login',
          run: 'echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > ~/.npmrc',
          env: {
            NPM_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          },
        },
        {
          name: 'setup node',
          uses: 'actions/setup-node@v3',
          with: {
            'node-version': project.minNodeVersion,
          },
        },
        {
          name: 'Install dependencies',
          run: 'npm --prefix ./source install ./source',
        },
        {
          name: 'generate coverage',
          run: 'npm --prefix ./source run coverage',
        },
        {
          name: 'zip coverage results',
          run: 'zip -r "./source/coverage/report.zip" "./source/coverage"',
        },
        {
          name: 'checkout wiki',
          uses: 'actions/checkout@v2',
          with: {
            repository: '${{github.repository}}.wiki',
            path: './wiki',
          },
        },
        {
          name: 'prep wiki upload directory',
          run: [
            'rm -rf "coverage/${{ steps.extract_branch.outputs.branch }}"',
            'mkdir -p "coverage/${{ steps.extract_branch.outputs.branch }}"',
          ].join(' && '),
        },
        {
          name: 'generate badges',
          run: 'npx jest-coverage-badges --input ./source/coverage/coverage-summary.json --output "./wiki/coverage/${{ steps.extract_branch.outputs.branch }}/badges"',
        },
        {
          name: 'include additional files',
          run: 'cp -a ./source/coverage/report.zip "./wiki/coverage/${{ steps.extract_branch.outputs.branch }}"',
        },
        {
          name: 'upload to wiki',
          run: [
            'cd ./wiki',
            'git config user.name "github-actions"',
            'git config user.email "github-actions@github.com"',
            'git add .',
            'git commit -m "chore(CodeCoverage): Update coverage results"',
            'git push origin master',
          ].join(' && '),
        },
      ],
    });
  }
}
