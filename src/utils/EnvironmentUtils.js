import config from '../conf/config.json';

/**
 * The default value of environment variable `REACT_APP_API_SOURCE`
 * if it is missing.
 */
const API_SOURCE_DEFAULT = 'LOCAL';

/**
 * Returns the environment variable `REACT_APP_API_SOURCE`.
 * 
 * @returns the configured value; the default is `LOCAL` if the variable is `undefined`
 */
export const getEnvVariableApiSource = () =>
    process.env.REACT_APP_API_SOURCE || API_SOURCE_DEFAULT;

/**
 * Returns the API URL corresponding to the configured API source.
 * 
 * @returns the API URL corresponding to the environment variable `REACT_APP_API_SOURCE`;
 *          replace `%YEAR%` with a year number before calling the API
 */
export const getApiUrl = () => config.api.urlFormat
    .replace("%API_BASE_URL%", config.api.baseUrl[getEnvVariableApiSource()]);