import './SearchScreen.css';

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

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

    const { t } = useTranslation();

    useEffect(() => {
        setError(null);
        setLoading(true);
        api.fetchData(year).then((result) => {
            if (result.success) {
                setApiData(result.schedule);
            } else {
                setError(getAPIErrorMessage(result, t));
                setApiData([]);
            }
        }).finally(() => setLoading(false));
    }, [year, t]);

    return (
        <div className='SearchScreen'>
            <h1>{t('sumoSchedLookup.title')}</h1>
            {error && (
                <div className='ErrorMessageBox' id='errorMessage'>
                    <div className='ErrorMessageHeading'>{t('error.heading')}</div>{error}
                </div>
            )}
            <form name='pickYear'>
                <YearDropdown selectedYear={year}
                    onChangeEvent={(event) => setYear(event.target.value)} />
            </form>
            {loading && (
                <div className='LoadingText' id='loadingText'>{t('loading')}</div>
            )}
            <ScheduleTable data={apiData} />
        </div>
    );
}

/**
 * Builds the error message to display on-screen for API call failures.
 * 
 * @param {APICallResult} result the API call result object
 * @param {*} t the translation function
 * @returns {string} the message configured by `error.messages.<result.error.type>`
 */
const getAPIErrorMessage = (result, t) => {
    let keyValues = {};
    switch (result.error.type) {
        case APICallResult.FailType.UnsuccessfulResponse:
            keyValues = { statusCode: result.error.statusCode };
            break;
        default:
    }
    return t(`error.message.${result.error.type}`, keyValues);
}