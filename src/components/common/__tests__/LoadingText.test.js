import { render } from "@testing-library/react";
import i18n from '../../../i18n';

import LoadingText from "../LoadingText";

test('Text not displayed.', () => {
    render(<LoadingText isLoading={false} />);
    expect(document.querySelector('#loadingText')).not.toBeInTheDocument();
});

describe('Text displayed', () => {
    test('Language - English.', () => runTest('en', 'Loading...'));
    test('Language - Chinese.', () => runTest('zh', '載入中...'));
    test('Language - Japanese.', () => runTest('ja', 'ロード中...'));
    /**
     * Runs a test case where the loading text is expected to be displayed.
     * @param {string} language the language code
     * @param {string} text the expected text
     */
    const runTest = (language, text) => {
        i18n.changeLanguage(language);
        render(<LoadingText isLoading={true} />);
        expect(document.querySelector('#loadingText').innerHTML).toEqual(text);
    }
})