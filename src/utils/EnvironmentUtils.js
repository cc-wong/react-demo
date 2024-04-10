import config from '../conf/config.json';

/**
 * Returns the app's version number.
 * 
 * @returns the version number configured in `package.json`
 */
export const getAppVersionNumber = () => process.env.REACT_APP_VERSION;

/**
 * Returns the API URL configured by the environment variables and configuration file,
 * and sets the `year` argument to a given value.
 * 
 * @param {number|string} year the value of the `year` argument
 * @returns the API URL
 * @throws `TypeError` if `REACT_APP_API_BASE_URL` is missing or empty
 */
export const getAPIURL = (year) => {
    if (!process.env.REACT_APP_API_BASE_URL) {
        throw new TypeError('REACT_APP_API_BASE_URL must be provided!');
    }
    return config.api.urlFormat
        .replace('%API_BASE_URL%', process.env.REACT_APP_API_BASE_URL)
        .replace('%YEAR%', year.toString());
}

/**
 * Returns the API timeout time.
 * @returns {number} the timeout time in seconds as configured by `config.json`
 */
export const getAPITimeout = () => config.api.timeout;