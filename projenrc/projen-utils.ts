// The following code was taken from from ts-jest as there some issues
// using this library directly during projen synth.
// https://github.com/kulshekhar/ts-jest

export const tsconfigPathsToModuleNameMapper = (
  mappings: Record<string, string[]>,
  { prefix = "", useESM = false }: { prefix?: string; useESM?: boolean }
): Record<string, string | string[]> => {
  // we don't need to escape all chars, so commented out is the real one
  // const escapeRegex = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const escapeRegex = (str: string) =>
    str.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");

  const jestMap: Record<string, string | string[]> = {};
  for (const fromPath of Object.keys(mappings)) {
    const toPaths = mappings[fromPath];

    // check that we have only one target path
    if (toPaths.length === 0) {
      console.warn(`Not mapping "${fromPath}" because it has no target.`);
      continue;
    }
    // split with '*'
    const segments = fromPath.split(/\*/g);

    if (segments.length === 1) {
      const paths = toPaths.map((target) => {
        const enrichedPrefix =
          prefix !== "" && !prefix.endsWith("/") ? `${prefix}/` : prefix;
        return `${enrichedPrefix}${target}`;
      });
      const cjsPattern = `^${escapeRegex(fromPath)}$`;
      jestMap[cjsPattern] = paths.length === 1 ? paths[0] : paths;
    } else if (segments.length === 2) {
      const paths = toPaths.map((target) => {
        const enrichedTarget =
          target.startsWith("./") && prefix !== ""
            ? target.substring(target.indexOf("/") + 1)
            : target;
        const enrichedPrefix =
          prefix !== "" && !prefix.endsWith("/") ? `${prefix}/` : prefix;

        return `${enrichedPrefix}${enrichedTarget.replace(/\*/g, "$1")}`;
      });

      if (useESM) {
        const esmPattern = `^${escapeRegex(segments[0])}(.*)${escapeRegex(
          segments[1]
        )}\\.js$`;
        jestMap[esmPattern] = paths.length === 1 ? paths[0] : paths;
      }

      const cjsPattern = `^${escapeRegex(segments[0])}(.*)${escapeRegex(
        segments[1]
      )}$`;
      jestMap[cjsPattern] = paths.length === 1 ? paths[0] : paths;
    } else {
      console.warn(
        `Not mapping ${fromPath} because it has more than one star (*).`
      );
    }
  }

  if (useESM) {
    jestMap["^(\\.{1,2}/.*)\\.js$"] = "$1";
  }
  return jestMap;
};

export declare const cdkAppTsconfigPaths: {
  "openapi3-ts": string[];
  zod: string[];
  "app/*": string[];
  "infra/*": string[];
  "@aws-cdk/*": string[];
  "aws-cdk-lib": string[];
  "aws-cdk-lib/*": string[];
  "aws-sdk": string[];
  "aws-sdk/*": string[];
  axios: string[];
  "cdk-nag": string[];
  constructs: string[];
  "datadog-cdk-constructs-v2": string[];
  projen: string[];
};
