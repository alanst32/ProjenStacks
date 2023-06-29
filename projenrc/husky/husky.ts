import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";

import { assign } from "lodash";
import { Component, TextFile, javascript } from "projen";

/**
 * Represents husky config (https://typicode.github.io/husky/#/).
 */
export class Husky extends Component {
  readonly huskyHookConfig: Record<string, string[]>;
  private readonly huskyDirName = ".husky";

  constructor(project: javascript.NodeProject) {
    super(project);

    this.huskyHookConfig = {};

    project.addDevDeps("husky@^7.0.0");

    project.setScript("prepare", "husky install");
  }

  /**
   * Override husky hooks.
   *
   * Here is an example of how we can add pre commit hooks
   * ```ts
   * overrideHusky({
   *   'pre-commit': ['npm run lint']
   * })
   * ```
   *
   * @param husky husky config
   */
  public overrideHusky(husky: Record<string, string[]>) {
    assign(this.huskyHookConfig, husky);
  }

  public synthesize(): void {
    const githubDir = path.join(this.project.outdir, ".git");

    // Initialise git repo if it does not exist.
    // The reason is because husky needs a git repo
    // so that it can bootstrap successfully.
    if (!fs.existsSync(githubDir)) {
      cp.execSync("git init", { cwd: this.project.outdir });
    }

    Object.keys(this.huskyHookConfig)
      .filter((hook) => this.huskyHookConfig[hook].length > 0)
      .forEach((hook) => {
        const hookFile = new TextFile(
          this.project,
          `${this.huskyDirName}/${hook}`,
          {
            executable: true,
            lines: [
              "#!/bin/sh",
              '. "$(dirname "$0")/_/husky.sh"',
              "",
              ...(this.huskyHookConfig[hook] ?? []),
              "",
            ],
          }
        );
        hookFile.addLine(`# ${hookFile.marker}`);
      });
  }
}
