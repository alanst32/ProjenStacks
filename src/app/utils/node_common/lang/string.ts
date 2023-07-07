import { Serializable } from './types';

/** An empty string constant. */
export const EMPTY_STRING = '';

/**
 * Fills a string template with supplied values.
 * The placeholder name that matches a property name in the values will be replaced with the value.
 * @param template The template string, i.e. `"Hi {user}" // {user} is the placeholder for user`
 * @param values The record containing the values for the template
 * @param wrapped Whether to replace wrapped placeholders only or any string that matches the value properties.
 * @returns The string replaced with placeholders replace with values.
 * @example
 * ```ts
 * const template = "Hi {user}, good {period}."
 * const result = fillTemplate(template, { user: 'John', period: 'morning' })
 * console.log(result) // "Hi John, good morning."
 * ```
 */
export const fillTemplate = (template: string, values: Record<string, Serializable>, wrapped = true): string => {
    let result = template;

    Object.keys(values).forEach(k => {
        const searchText = wrapped ? `\\$?\\{{1,2}${k}\\}{1,2}` : k;
        result = result.replace(new RegExp(searchText, 'gi'), values[k]?.toString() || 'undefined');
    });

    return result;
};
