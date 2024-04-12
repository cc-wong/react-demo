/**
 * Regex escape function.
 * 
 * @param {string} text the text to escape regex for
 * @returns the escaped text
 */
export const escapeRegex = (text) => text.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * Uses `jest.useFakeTimers()` to mock the "current" date.
 * 
 * @param {string} date the mock current date in `YYYY-MM-DD` format
 */
export const mockCurrentDate = (date) => jest.useFakeTimers().setSystemTime(new Date(date));

/**
 * Mocks a function to return a value.
 * @param {jest.SpyInstance<*} spyFunction the function to mock
 * @param {*} result the function's return value
 */
export const mockFunctionToReturnValue = (spyFunction, returnValue) =>
    spyFunction.mockImplementationOnce(() => Promise.resolve(returnValue));

/**
 * Mocks a function with a given amount of time in delay.
 * 
 * @param {jest.SpyInstance<*>} spyFunction the function to mock
 * @param {number} seconds the delay in seconds
 * @param {*} valueOrError the value to return or the error to throw after the delay
 */
export const mockFunctionWithDelay = (spyFunction, seconds, valueOrError) =>
    spyFunction.mockImplementationOnce(() => new Promise((resolve, reject) => setTimeout(() => {
        valueOrError instanceof Error ? reject(valueOrError) : resolve(valueOrError)
    }, seconds * 1000)));

/**
 * Simulates the advancement of time in a test case
 * by advancing the timer by a given amount of time.
 * 
 * @param {number} seconds time to advance in seconds
 */
export const advanceTimersBySeconds = async (seconds) => {
    jest.advanceTimersByTime(seconds * 1000);
    await new Promise(jest.requireActual('timers').setImmediate);
}