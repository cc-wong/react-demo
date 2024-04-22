import { fireEvent, render, screen } from "@testing-library/react"
import * as utils from '../../../testUtils';
import { APICallResult } from "../../../types/APICallResult";

import i18n from "../../../i18n";
import { I18nextProvider } from 'react-i18next';

import ErrorMessageBox from "../ErrorMessageBox"
import { getAPIErrorMessage } from "../ErrorMessageBox";

describe('ErrorMessageBox component', () => {
    /**
     * Mock event handler for the "RELOAD" button.
     */
    const mockReloadEvent = jest.fn();

    test('Box not displayed when no error.', () => {
        render(<ErrorMessageBox error={null} reloadEvent={mockReloadEvent} />);
        expect(document.querySelector('#errorMessage')).not.toBeInTheDocument();
    });

    describe('Box displayed - Unsuccessful API response', () => {
        test('Language = English.', () => runTest('en', 'System error!'));
        test('Language = Chinese.', () => runTest('zh', '系統發生錯誤！'));
        test('Language = Japanese.', () => runTest('ja', 'システムエラーが発生しました!'));
        /**
         * Runs a test case on displaying the error message box for unsuccessful API response.
         * @param {string} language the language code
         * @param {string} headerText the expected message header text
         */
        const runTest = (language, headerText) => {
            const error = {
                header: 'error.message.UnsuccessfulResponse.header',
                body: 'error.message.UnsuccessfulResponse.body',
                bodyArgs: {
                    statusCode: 500,
                    statusText: 'INTERNAL SERVER ERROR',
                    message: 'Test reason.'
                },
                displayRefresh: false
            };
            testBoxDisplayed(language, error, headerText, '500 INTERNAL SERVER ERROR - Test reason.');
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        }
    })

    describe('Box displayed - Error thrown on API call', () => {
        test('Language = English.', () => runTest('en', 'System error!'));
        test('Language = Chinese.', () => runTest('zh', '系統發生錯誤！'));
        test('Language = Japanese.', () => runTest('ja', 'システムエラーが発生しました!'));
        /**
         * Runs a test case on displaying the error message box for error thrown by the API call.
         * @param {string} language the language code
         * @param {string} headerText the expected message header text
         */
        const runTest = (language, headerText) => {
            const error = {
                header: 'error.message.ErrorThrown.header',
                body: 'error.message.ErrorThrown.body',
                bodyArgs: {
                    error: new TypeError('TEST')
                },
                displayRefresh: false
            };
            testBoxDisplayed(language, error, headerText, 'TypeError: TEST');
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        }
    })

    describe('Box displayed - API timeout', () => {
        /**
         * Error details data object for the test cases.
         */
        const error = {
            header: 'error.message.Timeout.header',
            body: 'error.message.Timeout.body',
            bodyArgs: {},
            displayRefresh: true
        };

        test('Language = English.', () => runTest('en', 'Timeout error!', 'Please try again.', 'RELOAD'));
        test('Language = Chinese.', () => runTest('zh', '發生逾時錯誤！', '請重新嘗試。', '重載'));
        test('Language = Japanese.', () =>
            runTest('ja', 'タイムアウトが発生しました!', 'もう一度お試しください。', '再読込'));
        /**
         * Runs a test case on displaying the error message box for API timeout.
         * @param {*} language the language code
         * @param {string} headerText the expected message header text
         * @param {string} bodyText the expected message body text
         * @param {*} reloadLabel the expected text on the Reload button
         */
        const runTest = (language, headerText, bodyText, reloadLabel) => {
            testBoxDisplayed(language, error, headerText, bodyText);
            expect(screen.getByRole('button')).toHaveTextContent(reloadLabel);
        }

        test('Click "RELOAD" button.', () => {
            render(<ErrorMessageBox error={error} reloadEvent={mockReloadEvent} />);
            fireEvent.click(screen.getByRole('button'));
            expect(mockReloadEvent.mock.calls).toHaveLength(1);
        })
    })

    /**
     * Runs a test case where the error message box is expected to be displayed.
     * @param {string} language the language code
     * @param {*} error the error details data
     * @param {string} headerText the expected message header text
     * @param {string} bodyText the expected message body text
     */
    const testBoxDisplayed = (language, error, headerText, bodyText) => {
        i18n.changeLanguage(language);
        render(
            <I18nextProvider i18n={i18n}>
                <ErrorMessageBox error={error} reloadEvent={mockReloadEvent} />
            </I18nextProvider>);
        const errorMessageBox = document.querySelector('#errorMessage');
        expect(errorMessageBox).toBeInTheDocument();
        expect(errorMessageBox.innerHTML)
            .toMatch(new RegExp(`${utils.escapeRegex(headerText)}.*${utils.escapeRegex(bodyText)}`));
    }
})

describe('getAPIErrorMessage', () => {
    test('Unsuccessful API response.', () => {
        const error = {
            type: APICallResult.FailType.UnsuccessfulResponse,
            statusCode: 500,
            statusText: 'INTERNAL SERVER ERROR',
            reason: 'Test reason.'
        };
        expect(getAPIErrorMessage(error, error.reason)).toEqual({
            header: 'error.message.UnsuccessfulResponse.header',
            body: 'error.message.UnsuccessfulResponse.body',
            bodyArgs: {
                statusCode: 500,
                statusText: 'INTERNAL SERVER ERROR',
                message: 'Test reason.'
            },
            displayRefresh: false
        });
    });

    test('Error thrown by API.', () => {
        const thrownError = new TypeError('TEST');
        const error = {
            type: APICallResult.FailType.ErrorThrown,
            reason: thrownError
        };
        expect(getAPIErrorMessage(error)).toEqual({
            header: 'error.message.ErrorThrown.header',
            body: 'error.message.ErrorThrown.body',
            bodyArgs: {
                error: thrownError
            },
            displayRefresh: false
        });
    });

    test('API timeout.', () => {
        expect(getAPIErrorMessage({ type: APICallResult.FailType.Timeout })).toEqual({
            header: 'error.message.Timeout.header',
            body: 'error.message.Timeout.body',
            bodyArgs: {},
            displayRefresh: true
        });
    });
})