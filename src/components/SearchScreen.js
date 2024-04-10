import './SearchScreen.css';

import textConfig from '../conf/text-config.json';

import { useEffect, useState } from "react";

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";
import * as api from '../api/ScheduleWebservice';
import { APICallResult } from '../types/APICallResult';
import { getCurrentYear } from '../utils/DateUtils';

/**
 * Populates the search screen which includes a dropdown for the year
 * and the results table.
 * 
 * @returns a wrapper component including the dropdown and table
 */
export default function SearchScreen() {
    const [year, setYear] = useState(getCurrentYear().toString());
    const [apiData, setApiData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        api.fetchData(year).then((result) => {
            if (result.success) {
                setApiData(result.data);
                setError(null);
            } else {
                setError(getAPIErrorMessage(result));
                setApiData([]);
            }
        }).finally(() => setLoading(false));
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
            <ScheduleTable data={apiData} />
        </div>
    );
}

/**
 * Builds the error message to display on-screen for API call failures.
 * 
 * @param {APICallResult} result the API call result object
 * @returns {string} the message configured by `error.messages.<result.error.type>`
 */
const getAPIErrorMessage = (result) => {
    var message = textConfig.error.messages[result.error.type];
    switch (result.error.type) {
        case APICallResult.FailType.UnsuccessfulResponse:
            return message.replace("%STATUS_CODE%", result.error.statusCode);
        default:
            return message;
    }
}