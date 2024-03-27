import './SearchScreen.css';

import { useRef } from "react";

import YearDropdown from "./YearDropdown";
import ScheduleTable from "./ScheduleTable";

/**
 * Denotes the schedule of a tournament in the API call JSON data.
 * 
 * @typedef {{basho: string; dates: string[]; month: number; month_name: string;}} BashoJson
 */

/**
 * Populates the search screen which includes a dropdown for the year
 * and the results table.
 * 
 * @returns a wrapper component including the dropdown and table
 */
export default function SearchScreen() {
    // TODO: Get year from form, or use current year.
    var year = (new Date()).getFullYear();

    // Get data from API call.
    var apiData = getData();

    // const handleSubmit = () => { yearForm.current.submit() }

    // const submitAction = (e) => {
    //     e.preventDefault();

    //     alert(`Selected year = ${document.getElementById('year').value}`);
    // }

    var yearForm = useRef();
    return (
        <div className='SearchScreen'>
            <form ref={yearForm} name='pickYear'>
                <YearDropdown selectedYear={year} />
            </form>
            <ScheduleTable data={apiData.result} />
        </div>
    );
}

/**
 * Gets the data for display.
 * 
 * @returns {{result: BashoJson[]}} the data in JSON format
 */
function getData() {
    return require('./getSumoHonbashoSchedule.json');
}
