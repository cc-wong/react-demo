import './SumoScheduleLookup.css';

import parse from 'html-react-parser';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";
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
    const [error, setError] = useState(null);

    const { t } = useTranslation();

    useEffect(() => {
        setError(null);
        setLoading(true);
        api.fetchData(year).then((result) => {
            if (result.success) {
                setApiData(result.responseData);
            } else {
                setError(getAPIErrorMessage(result, t));
                setApiData([]);
            }
        }).finally(() => setLoading(false));
    }, [year, t]);

    return (
        <div className='SumoScheduleLookup'>
            <h1>{t('sumoSchedLookup.title')}</h1>
            {error && (
                <div className='ErrorMessageBox' id='errorMessage'>
                    <div className='ErrorMessageHeading'>{error.header}</div>
                    {parse(error.body)}
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
 * @returns {{header: string; body: string}} the error message header and body to display
 */
const getAPIErrorMessage = (result, t) => {
    let bodyKeys = {};
    switch (result.error.type) {
        case APICallResult.FailType.UnsuccessfulResponse:
            bodyKeys = {
                statusCode: result.error.statusCode,
                statusText: result.error.statusText,
                message: result.error.reason.message
            };
            break;
        case APICallResult.FailType.ErrorThrown:
            bodyKeys.error = result.error.reason;
            break;
        default:
    }
    return {
        header: t(`error.message.${result.error.type}.header`),
        body: t(`error.message.${result.error.type}.body`, bodyKeys)
    };
}