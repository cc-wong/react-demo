import './SearchScreen.css';

import textConfig from '../conf/text-config.json';

import { useEffect, useState } from "react";

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";
import { getCurrentYear } from '../utils/DateUtils';
import { getApiUrl } from '../utils/EnvironmentUtils';
import { APIError } from '../types/APIError';

/**
 * The initial (default) value of the state `apiData`.
 */
const initialApiData = { result: [] };

/**
 * Populates the search screen which includes a dropdown for the year
 * and the results table.
 * 
 * @returns a wrapper component including the dropdown and table
 */
export default function SearchScreen() {
    const [year, setYear] = useState(getCurrentYear);
    const [apiData, setApiData] = useState(initialApiData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(apiUrl(year)).then(getResponseBody).then(setApiData).then(setError(null))
            .catch((error) => {
                console.error(`Error caught: ${error}`);
                setError(buildAPIErrorMessage(error));
                setApiData(initialApiData);
            })
            .finally(() => setLoading(false));
    }, [year]);

    return (
        <div className='SearchScreen'>
            {error && (
                <div className='ErrorMessageBox' id='errorMessage'>
                    <div className='ErrorMessageHeading'>{textConfig.error.title}</div>{error}
                </div>
            )}
            <form name='pickYear'>
                <YearDropdown selectedYear={year}
                    onChangeEvent={(event) => setYear(event.target.value)} />
            </form>
            {loading && (
                <div className='LoadingText' id='loadingText'>{textConfig.loading}</div>
            )}
            <ScheduleTable data={apiData.result} />
        </div>
    );
}

/**
 * Builds the API URL.
 * 
 * @param {number} year the year to retrieve data for
 * @returns the URL with the `%YEAR%` token replaced with `year`
 */
const apiUrl = (year) => {
    const url = getApiUrl().replace("%YEAR%", year.toString());
    console.debug(`API URL: ${url}`);
    return url;
}

/**
 * Gets the body of a given API call response.
 * 
 * @param {Response} response the response object returned from the call
 * @returns {Promise} the response's JSON body
 * @throws `APIError` if the response's OK status is `false`, ie. not successful
 */
const getResponseBody = (response) => {
    console.debug(`Returned status code: ${response.status} (ok: ${response.ok})`);
    if (!response.ok) {
        console.error(response);
        throw new APIError(response.status);
    }
    return response.json();
}

/**
 * Builds the error message to display on-screen for API call failures.
 * 
 * @param {Error} error the API call error
 * @returns the message configured by `error.messages.apiFailStatusCode` if
 *          the error is an `APIError`, meaning that a response was returned
 *          but with a non-200 status code; the message configured by
 *          `error.messages.apiCallError` otherwise
 */
const buildAPIErrorMessage = (error) => error instanceof APIError ?
    textConfig.error.messages.apiFailStatusCode.replace("%STATUS_CODE%", error.statusCode) :
    textConfig.error.messages.apiCallError;