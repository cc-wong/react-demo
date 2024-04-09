/**
 * Error type denoting that an API call returned a not-OK status code
 * (currently one other than 200).
 */
export class APIError extends Error {

    /**
     * Enumeration denoting the type of API call failure.
     */
    static ErrorType = {
        /**
         * API call returns with unsuccessful response, ie. non-200 status code.
         */
        UnsuccessfulResponse: "UnsuccessfulResponseError",
        /**
         * API call timeout.
         */
        Timeout: "TimeoutError",
        /**
         * API call throws error.
         */
        APICallError: "APICallError"
    }

    /**
     * The status code returned from the API call.
     * @type number
     */
    statusCode;

    /**
     * Constructor.
     * 
     * @param {string} type denotes the error type; expects one of those in `ErrorType`
     * @param {number} statusCode the status code returned from the API call
     * @param {string} message the error message
     */
    constructor(type, statusCode, message) {
        super(message);

        this.name = type;
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, APIError.prototype);
    }

    /**
     * Initializes an `UnsuccessfulResponse` error.
     * 
     * @param {number} statusCode the status code returned from the API call 
     * @returns the new error object
     */
    static InitUnsuccessfulResponseError(statusCode) {
        return new APIError(APIError.ErrorType.UnsuccessfulResponse, statusCode,
            `API call returned status code: ${statusCode}`);
    }

    static InitTimeoutError() {
        return new APIError(APIError.ErrorType.Timeout, 0, 'API call timed out.');
    }
}