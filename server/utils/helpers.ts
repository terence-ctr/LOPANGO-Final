/**
 * Check if a string is valid JSON
 * @param str String to check
 * @returns boolean indicating if the string is valid JSON
 */
export const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Safely parses a JSON string and returns the parsed object or the original value
 * @param value The value to parse
 * @returns The parsed object or the original value
 */
export const safeJsonParse = <T>(value: string | T): T => {
  if (typeof value !== 'string') {
    return value;
  }
  
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return value as unknown as T;
  }
};

/**
 * Get a nested property from an object using a dot-notation path
 * @param obj The object to get the property from
 * @param path The dot-notation path to the property
 * @param defaultValue The default value to return if the property is not found
 * @returns The value of the property or the default value
 */
export const getNestedValue = <T>(
  obj: Record<string, any>,
  path: string,
  defaultValue?: T
): T | undefined => {
  const value = path
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  
  return value !== undefined ? value : defaultValue;
};

/**
 * Converts an object to a query string
 * @param params The parameters object
 * @returns A query string
 */
export const toQueryString = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
};

/**
 * Sanitizes an object by removing undefined and null values
 * @param obj The object to sanitize
 * @returns A new object without undefined or null values
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};
