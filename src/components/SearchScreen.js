import './SearchScreen.css';

import { useEffect, useState } from "react";

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";
import { getCurrentYear } from '../utils/DateUtils';
import { APIError } from '../types/APIError';

/**
 * The base URL for the API call.
 * 
 * Hard-coding is temporary. To be configurable later.
 */
const apiBaseUrl = "http://localhost:5000";
// const apiBaseUrl = "https://python-webservice-demo.onrender.com";

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
    const [error, setError] = useState(null);

    useEffect(() => {
        const url = `${apiBaseUrl}/getSumoHonbashoSchedule?year=${year}`;
        console.debug(`API URL: ${url}`);
        fetch(url)
            .then((response) => {
                console.debug(`Status code: ${response.status}, ok: ${response.ok}`);
                if (!response.ok) {
                    console.error(response);
                    throw new APIError(response.status);
                }
                return response.json();
            })
            .then(setApiData)
            .catch((error) => {
                console.error("Error caught: " + error);
                setError(error instanceof APIError ?
                    `Could not retrieve data (returned status code ${error.statusCode})` :
                    'Could not retrieve data (error on making API call)');
                setApiData(initialApiData);
            });
    }, [year]);

    return (
        <div className='SearchScreen'>
            {(error &&
                <div className='ErrorMessageBox' id='errorMessage'>
                    <div className='ErrorMessageHeading'>ERROR</div>{error}
                </div>
            ) || <></>}
            <form name='pickYear'>
                <YearDropdown selectedYear={year}
                    onChangeEvent={((event) => {
                        setYear(event.target.value);
                        setError(null);
                    })} />
            </form>
            <ScheduleTable data={apiData.result} />
        </div>
    );
}