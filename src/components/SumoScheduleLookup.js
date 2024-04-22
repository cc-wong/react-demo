import './SumoScheduleLookup.css';

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import YearDropdown from "./sumo/YearDropdown";
import ScheduleTable from "./sumo/ScheduleTable";
import ErrorMessageBox from './common/ErrorMessageBox';
import { getAPIErrorMessage } from './common/ErrorMessageBox';

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
                setError(getAPIErrorMessage(result.error, getErrorMessageFromResponse(result.error)));
                setApiData([]);
            }
        }).finally(() => setLoading(false));
    }, [year, refresh]);

    return (
        <div className='SumoScheduleLookup'>
            <h1 className={`title-${i18n.language}`}>{t('sumoSchedLookup.title')}</h1>
            <ErrorMessageBox error={error} reloadEvent={() => setRefresh(r => r + 1)} />
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
 * Gets the error message from an unsuccessful API response.
 * @param {*} error the error details data object
 * @returns
 *      the value of `error.reason.message` for unsuccessful API response errors,
 *      an empty string otherwise
 */
const getErrorMessageFromResponse = (error) =>
    (error.type === APICallResult.FailType.UnsuccessfulResponse) ? error.reason.message : '';