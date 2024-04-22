import './SumoScheduleLookup.css';

import parse from 'html-react-parser';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import YearDropdown from "./sumo/YearDropdown";
import ScheduleTable from "./sumo/ScheduleTable";
import * as api from '../api/SumoScheduleService';
import { APICallResult } from '../types/APICallResult';
import { getCurrentYear } from '../utils/DateUtils';

/**
 * Component for the Grand Sumo Schedule Lookup module.
 * @returns a wrapper component including the dropdown and table
 */
export default function SumoScheduleLookup() {
    const [year, setYear] = useState(getCurrentYear().toString());
    const [apiData, setApiData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [error, setError] = useState(null);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        setError(null);
        setLoading(true);
        api.fetchData(year).then((result) => {
            if (result.success) {
                setApiData(result.responseData);
            } else {
                setError(getAPIErrorMessage(result));
                setApiData([]);
            }
        }).finally(() => setLoading(false));
    }, [year, refresh]);

    return (
        <div className='SumoScheduleLookup'>
            <h1 className={`title-${i18n.language}`}>{t('sumoSchedLookup.title')}</h1>
            {error && (
                <div className='ErrorMessageBox' id='errorMessage'>
                    <div className='Header'>{t(error.header)}</div>
                    {parse(t(error.body, error.bodyArgs))}
                    {error.displayRefresh &&
                        (<>
                            <br />
                            <button className='Reload' onClick={() => setRefresh(r => r + 1)}>
                                {t('error.reload')}
                            </button>
                        </>)}
                </div>
            )}
            <form name='pickYear'>
                <YearDropdown selectedYear={year}
                    onChangeEvent={(event) => setYear(event.target.value)} />
            </form>
            {/* <div>
                <button onClick={() => setYear(2000)}>Test: Year 2000</button>
                &nbsp;
                <button onClick={() => setYear(10000)}>Test: Greater than MAX_YEAR</button>
            </div> */}
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
 * @returns {{header: string; body: string; bodyArgs: *; displayRefresh: boolean}}
 *      translation keys for the error message header and body, arguments for the message body,
 *      and a flag to control whether to display a refresh button
 */
const getAPIErrorMessage = (result) => {
    let bodyArgs = {};
    let displayRefresh = false;
    switch (result.error.type) {
        case APICallResult.FailType.UnsuccessfulResponse:
            bodyArgs = {
                statusCode: result.error.statusCode,
                statusText: result.error.statusText,
                message: result.error.reason.message
            };
            break;
        case APICallResult.FailType.ErrorThrown:
            bodyArgs.error = result.error.reason;
            break;
        case APICallResult.FailType.Timeout:
            displayRefresh = true;
            break;
        default:
    }
    return {
        header: `error.message.${result.error.type}.header`,
        body: `error.message.${result.error.type}.body`,
        bodyArgs: bodyArgs,
        displayRefresh: displayRefresh
    };
}