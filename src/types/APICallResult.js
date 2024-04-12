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
     * The tournament schedule for the given year if the API call was successful.
     * @type Tournament[]
     */
    schedule;

    /**
     * Error details if the API call failed.
     * @type {{type: string; statusCode: number}}
     */
    error;

    /**
     * Constructor.
     * 
     * Please use one of the static methods to initialize an instance instead.
     * @param {boolean} success whether the API call was successful
     * @param {{schedule: Tournament[]; error: {type: string; statusCode: number}}} result 
     *           data returned by the API call or error details of the failure
     */
    constructor(success, { schedule = [], error = {} }) {
        this.success = success;
        this.schedule = schedule;
        this.error = error;
    }

    /**
     * Initializes a result object for a successful API call.
     * @param {Tournament[]} schedule the tournament schedule returned from the API call
     * @returns {APICallResult}
     *          a new object where `success` is `true` and the value of `schedule` is set to `schedule`
     */
    static InitForSuccessfulResponse(schedule) {
        return new APICallResult(true, { schedule: schedule });
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