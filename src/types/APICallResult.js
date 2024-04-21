/**
 * Data type denoting the result of an API call.
 */
export class APICallResult {

    /**
     * Enumeration denoting the failure type.
     */
    static FailType = {
        /**
         * API call returns with unsuccessful response, ie. non-200 status code.
         */
        UnsuccessfulResponse: "UnsuccessfulResponse",
        /**
         * API call timeout.
         */
        Timeout: "Timeout",
        /**
         * Error thrown by API call.
         */
        ErrorThrown: "ErrorThrown"
    }

    /**
     * Denotes whether the API call was successful.
     * @type boolean
     */
    success;

    /**
     * Parsed data from the response of a successful API call.
     */
    responseData;

    /**
     * Data type for API call failure details.
     * @typedef {{type: string; statusCode: number; statusText: string; reason: string|Error}} ErrorData
     */
    /**
     * Error details if the API call failed.
     * @type {ErrorData}
     */
    error;

    /**
     * Constructor.
     * 
     * Please use one of the static methods to initialize an instance instead.
     * @param {boolean} success whether the API call was successful
     * @param {{responseData: any; error: {ErrorData}}} result 
     *           data returned by the API call or error details of the failure
     */
    constructor(success, { responseData = null, error = {} }) {
        this.success = success;
        this.responseData = responseData;
        this.error = error;
    }

    /**
     * Initializes a result object for a successful API call.
     * @param {*} data the data from the API call response
     * @returns {APICallResult}
     *          a new object where `success` is `true` and `responseData` is set to `data`
     */
    static InitForSuccessfulResponse(data) {
        return new APICallResult(true, { responseData: data });
    }

    /**
     * Initializes a result object for an unsuccessful API call.
     * @param {Object} response the massaged API response
     * @param {number} response.statusCode the response status code
     * @param {string} response.statusText the status text corresponding to `statusCode`
     * @param {string} response.reason
     *      the response body, which would usually include the failure/error message
     * @returns a new object where `success` is `false`, `error.type` is `UnsuccessfulResponse`
     *      and the remaining fields are set according to the values in `response`
     */
    static InitForUnsuccessfulResponse({ statusCode, statusText, reason }) {
        return new APICallResult(false, {
            error: {
                type: APICallResult.FailType.UnsuccessfulResponse,
                statusCode: statusCode,
                statusText: statusText,
                reason: reason
            }
        });
    }

    /**
     * Initializes a result object for an API call timeout.
     * @returns a new object where `success` is `false` and `error.type` is `Timeout`
     */
    static InitForTimeout() {
        return new APICallResult(false, {
            error: { type: APICallResult.FailType.Timeout }
        });
    }

    /**
     * Initializes a result object for an API call timeout.
     * @param {Error} error the error thrown by the API call
     * @returns a new object where `success` is `false` and `error.type` is `ErrorThrown`
     */
    static InitForErrorThrown(error) {
        return new APICallResult(false, {
            error: { type: APICallResult.FailType.ErrorThrown, reason: error }
        });
    }
}