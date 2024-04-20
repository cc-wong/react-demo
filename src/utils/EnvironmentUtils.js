import config from '../conf/config.json';

/**
 * Returns the app's version number.
 * 
 * @returns the version number configured in `package.json`
 */
export const getAppVersionNumber = () => process.env.REACT_APP_VERSION;

/**
 * Returns the API URL configured by the environment variables and configuration file.
 * @param {string} keySuffix the suffix for the configuration and environment variable keys
 * @returns {string} the API URL as configured by `config.api.urlFormat.<keySuffix>`,
 *          where `%API_BASE_URL%` is replaced by the base URL configured by
 *          environment variable `REACT_APP_API_BASE_URL_<keySuffix>`
 * @throws `TypeError` if `REACT_APP_API_BASE_URL_<keySuffix>` is missing or empty
 */
export const getAPIURL = (keySuffix) => {
    const baseUrlEnvKey = `REACT_APP_API_BASE_URL_${keySuffix}`;
    if (!process.env[baseUrlEnvKey]) {
        throw new TypeError(`${baseUrlEnvKey} must be provided!`);
    }
    return config.api.urlFormat[keySuffix].replace('%API_BASE_URL%', process.env[baseUrlEnvKey]);
}

/**
 * Returns the API timeout time.
 * @returns {number} the timeout time in seconds as configured by `config.json`
 */
export const getAPITimeout = () => config.api.timeout;