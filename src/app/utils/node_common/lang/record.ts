/**
 * Returns the record with lowered-case property name. This function does not traverse the record recursively.
 * @param record The record with string index.
 * @returns The record with lower-cased property names.
 */
export const toLowerCasedKey = <T>(record: Record<string, T>) => {
    if (!record) return record;

    const newRecord: Record<string, T> = {};
    Object.keys(record).forEach(key => {
        newRecord[key.toLowerCase()] = record[key];
    });
    return newRecord;
};
