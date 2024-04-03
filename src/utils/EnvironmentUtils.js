import config from '../conf/config.json';

/**
 * Returns the app's version number.
 * 
 * @returns the version number configured in `package.json`
 */
export const getAppVersionNumber = () => process.env.REACT_APP_VERSION;

/**
 * Returns the API URL configured by the environment variables.
 * 
 * @returns the API URL as configured by environment variable `REACT_APP_API_BASE_URL`;
 *          replace `%YEAR%` with a year number before calling the API
 * @throws `TypeError` if `REACT_APP_API_BASE_URL` is missing or empty
 */
export const getApiUrl = () => {
    if (!process.env.REACT_APP_API_BASE_URL) {
        throw new TypeError('REACT_APP_API_BASE_URL must be provided!');
    }
    return config.api.urlFormat
        .replace("%API_BASE_URL%", process.env.REACT_APP_API_BASE_URL);
}

/**
 * Returns the environment variable `REACT_APP_REMOTE_API`.
 * 
 * @returns {boolean} the value of `REACT_APP_REMOTE_API`, or `false` if it is not configured
 * @deprecated May no longer be needed in the future if the Render instance spin-down issue is solved
 */
export const isRemoteApi = () => process.env.REACT_APP_REMOTE_API?.toLowerCase() === "true";