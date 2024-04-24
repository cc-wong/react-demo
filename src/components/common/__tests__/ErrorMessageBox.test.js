import { render, screen } from "@testing-library/react"
import * as utils from '../../../testUtils';
import { APICallResult } from "../../../types/APICallResult";
import expecteds from '../../../testData-expecteds.json';

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
        test('Language = English.', () => runTest('en'));
        test('Language = Chinese.', () => runTest('zh'));
        test('Language = Japanese.', () => runTest('ja'));
        /**
         * Runs a test case on displaying the error message box for unsuccessful API response.
         * @param {string} language the language code
         */
        const runTest = (language) => {
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
            testBoxDisplayed(language, error, expecteds.errorMessage.unsuccessfulAPIResponse.header[language],
                '500 INTERNAL SERVER ERROR - Test reason.');
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        }
    })

    describe('Box displayed - Error thrown on API call', () => {
        test('Language = English.', () => runTest('en'));
        test('Language = Chinese.', () => runTest('zh'));
        test('Language = Japanese.', () => runTest('ja'));
        /**
         * Runs a test case on displaying the error message box for error thrown by the API call.
         * @param {string} language the language code
         */
        const runTest = (language) => {
            const error = {
                header: 'error.message.ErrorThrown.header',
                body: 'error.message.ErrorThrown.body',
                bodyArgs: {
                    error: new TypeError('TEST')
                },
                displayRefresh: false
            };
            testBoxDisplayed(language, error,
                expecteds.errorMessage.apiErrorThrown.header[language], 'TypeError: TEST');
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

        test('Language = English.', () => testDisplayed('en'));
        test('Language = Chinese.', () => testDisplayed('zh'));
        test('Language = Japanese.', () => testDisplayed('ja'));
        /**
         * Runs a test case on displaying the error message box for API timeout.
         * @param {*} language the language code
         */
        const testDisplayed = (language) => {
            const texts = expecteds.errorMessage.apiTimeout;
            testBoxDisplayed(language, error, texts.header[language], texts.body[language]);
            expect(screen.getByRole('button')).toHaveTextContent(texts.reloadButtonLabel[language]);
        }

        test('Click "RELOAD" button - English.', () => testClickReload('en'));
        test('Click "RELOAD" button - Chinese.', () => testClickReload('zh'));
        test('Click "RELOAD" button - Japanese.', () => testClickReload('ja'));
        /**
         * Runs a test case on clicking the "RELOAD" button.
         * @param {string} language the language code
         */
        const testClickReload = (language) => {
            i18n.changeLanguage(language);
            render(<ErrorMessageBox error={error} reloadEvent={mockReloadEvent} />);
            utils.fireClickButtonEvent(expecteds.errorMessage.apiTimeout.reloadButtonLabel[language]);
            expect(mockReloadEvent.mock.calls).toHaveLength(1);
        }
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