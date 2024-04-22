import './ErrorMessageBox.css';

import { useTranslation } from "react-i18next";
import { APICallResult } from "../../types/APICallResult";

import parse from 'html-react-parser';

/**
 * Data type for the error details object used for populating the error message.
 * @typedef {{header: string; body: string; bodyArgs: *; displayRefresh: boolean}} ErrorDetails
 */
/**
 * 
 * @param props component attributes
 * @param {ErrorDetails} props.error error details for populating the error message
 * @param {Function} props.reloadEvent
 *      the event handler on clicking the "RELOAD" button displayed for API timeout errors
 * @returns a `<div>` HTML element for the error message box
 */
export default function ErrorMessageBox(props) {
    const { t } = useTranslation();
    if (props.error) {
        const error = props.error;
        return (
            <div className='ErrorMessageBox' id='errorMessage'>
                <div className='Header'>{t(error.header)}</div>
                {parse(t(error.body, error.bodyArgs))}
                {error.displayRefresh &&
                    (<>
                        <br />
                        <button className='Reload' onClick={props.reloadEvent}>
                            {t('error.reload')}
                        </button>
                    </>)}
            </div>);
    }
    return (<></>);
}

/**
 * Prepares the data for populating error on-screen.
 * @param {{type: string; statusCode?: number; statusText?: string; reason?: *}} error 
 *      data object containing error details
 * @param {string} message
 *      the error message returned from the response body (only for unsuccessful responses)
 * @returns {ErrorDetails}
 *      translation keys for the error message header and body, arguments for the message body,
 *      and a flag to control whether to display a refresh button
 */
export const getAPIErrorMessage = (error, message = '') => {
    let bodyArgs = {};
    let displayRefresh = false;
    switch (error.type) {
        case APICallResult.FailType.UnsuccessfulResponse:
            bodyArgs = {
                statusCode: error.statusCode,
                statusText: error.statusText,
                message: message
            };
            break;
        case APICallResult.FailType.ErrorThrown:
            bodyArgs.error = error.reason;
            break;
        case APICallResult.FailType.Timeout:
            displayRefresh = true;
            break;
        default:
    }
    return {
        header: `error.message.${error.type}.header`,
        body: `error.message.${error.type}.body`,
        bodyArgs: bodyArgs,
        displayRefresh: displayRefresh
    };
}