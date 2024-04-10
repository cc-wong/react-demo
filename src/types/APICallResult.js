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
     * Denotes the schedule of a tournament.
     * @typedef {{basho: string; dates: string[]; month: number; month_name: string;}} BashoJson
     */
    /**
     * The tournament schedule for the given year if the API call was successful.
     * @type BashoJson[]
     */
    data;

    /**
     * Denotes the error details.
     * 
     * For `type`, use one of `FailType`.
     * 
     * @typedef {{type: string; statusCode: number}} ErrorDetails
     */
    /**
     * Error details if the API call failed.
     * @type ErrorDetails
     */
    error;

    /**
     * Constructor.
     * 
     * Please use one of the static methods to initialize an instance instead.
     * @param {boolean} success whether the API call was successful
     * @param {{data: BashoJson[]; error: ErrorDetails}} result 
     *           data returned by the API call or error details of the failure
     */
    constructor(success, { data = [], error = {} }) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    /**
     * Initializes a result object for a successful API call.
     * @param {BashoJson[]} schedule the tournament schedule returned from the API call
     * @returns a new object where `success` is `true` and the value of `schedule` is set to `data`
     */
    static InitForSuccessfulResponse(schedule) {
        return new APICallResult(true, { data: schedule });
    }

    /**
     * Initializes a result object for an unsuccessful API call.
     * @param {number} statusCode the status code returned from the API call
     * @returns a new object where `success` is `false`, `error.type` is `UnsuccessfulResponse`
     *      and `error.statusCode` is `statusCode`
     */
    static InitForUnsuccessfulResponse(statusCode) {
        return new APICallResult(false, {
            error: {
                type: APICallResult.FailType.UnsuccessfulResponse,
                statusCode: statusCode
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
     * @returns a new object where `success` is `false` and `error.type` is `ErrorThrown`
     */
    static InitForErrorThrown() {
        return new APICallResult(false, {
            error: { type: APICallResult.FailType.ErrorThrown }
        });
    }
}