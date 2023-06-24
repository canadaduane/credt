/**
 *
 * @param {string} filename
 * @param {string | null} relativeUrl Can be used to pass `import.meta.url` of calling file
 * @returns {Promise<string>}
 */
export function readFile(filename: string, relativeUrl?: string | null): Promise<string>;
