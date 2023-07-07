/**
 * Remove duplicate items in an array.
 * @param items The input array of items.
 * @returns Unique items.
 * @example
 * ```ts
 * uniq([1, 2, 1, 4, 1, 3] // returns [1, 2, 4, 3]
 * ```
 */
export const uniq = <T>(items: T[]) => [...new Set(items)];

/**
 * Return duplicated items in an array.
 * @param arr The input array of items.
 * @returns Duplicated items.
 * @example
 * ```ts
 * dupe([1, 1, 1, 2, 3, 4, 5, 5]) // returns [1, 5]
 * ```
 */
export const dupe = <T>(arr: T[]) => {
  return uniq(arr.filter((item, i) => arr.indexOf(item) !== i));
};
