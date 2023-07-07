export type JsonMaskProps = {
  /** Whether to ignore the property name case. */
  ignoreCase: boolean;

  /** The replacement value. */
  replacement: string;
};

/**
 * Returns a JSON masking function that replaces the value of properties with name that matches the supplied keywords.
 * The masking function is capable of recursively traversing the properties within an object.
 * @param keywords The property names whose values will be masked.
 * @param param {@link JsonMaskProps}
 * @returns The masking function.
 */
export const JsonMask = (keywords: string[], props?: Partial<JsonMaskProps>) => {
  const opts = { ignoreCase: false, replacement: '********', ...props };

  const strip = (obj: Record<string, any>) => {
    if (obj === null || typeof obj !== 'object') return obj;

    const keys = Object.keys(obj);

    keys.forEach(key => {
      const isMatched = keywords.some(keyword =>
        opts.ignoreCase ? `${key}`.toLowerCase() === `${keyword}`.toLowerCase() : key === keyword
      );

      if (isMatched) {
        obj[key] = opts.replacement;
      }

      if (typeof obj[key] === 'object') {
        strip(obj[key]);
      }
    });

    return obj;
  };

  return (obj: any) => {
    const clone = JSON.parse(JSON.stringify(obj));
    return strip(clone);
  };
};
