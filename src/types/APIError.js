/**
 * Error type denoting that an API call returned a not-OK status code
 * (currently one other than 200).
 */
export class APIError extends Error {

    /**
     * The status code returned from the API call.
     * @type number
     */
    statusCode;

    /**
     * Constructor.
     * 
     * @param {number} statusCode the status code returned from the API call
     */
    constructor(statusCode) {
        super(`API call returned status code: ${statusCode}`);
        this.name = 'APIError';
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, APIError.prototype);
    }
}