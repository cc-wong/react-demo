import { render } from "@testing-library/react";
import i18n from '../../../i18n';
import expecteds from '../../../testData-expecteds.json';

import LoadingText from "../LoadingText";

test('Text not displayed.', () => {
    render(<LoadingText isLoading={false} />);
    expect(document.querySelector('#loadingText')).not.toBeInTheDocument();
});

describe('Text displayed', () => {
    test('Language - English.', () => runTest('en'));
    test('Language - Chinese.', () => runTest('zh'));
    test('Language - Japanese.', () => runTest('ja'));
    /**
     * Runs a test case where the loading text is expected to be displayed.
     * @param {string} language the language code
     */
    const runTest = (language) => {
        i18n.changeLanguage(language);
        render(<LoadingText isLoading={true} />);
        expect(document.querySelector('#loadingText').innerHTML).toEqual(expecteds.loading[language]);
    }
})