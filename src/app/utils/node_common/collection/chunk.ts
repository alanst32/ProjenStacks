/**
 * Divide an array into multiple chunks.
 * @param items The array to divide.
 * @param size The size of each chunk.
 * @typeParam T The item type.
 * @returns Chunks of items from the input array.
 */
export const chunk = <T>(items: T[], size: number) => {
  return items.reduce((arr, item, idx) => {
    return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, [] as T[][]);
};
