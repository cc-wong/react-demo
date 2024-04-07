import './SearchScreen.css';

import textConfig from '../conf/text-config.json';

import { useEffect, useState } from "react";

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";
import * as api from '../api/ScheduleWebservice';
import { getCurrentYear } from '../utils/DateUtils';
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
    const [year, setYear] = useState(getCurrentYear().toString());
    const [apiData, setApiData] = useState(initialApiData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        api.getData(year).then(setApiData).then(setError(null))
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