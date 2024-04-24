import { cleanup, render } from "@testing-library/react";
import * as testUtils from '../../testUtils';
import i18n from '../../i18n';
import expecteds from '../../testData-expecteds.json';

import About from '../About';

afterEach(() => cleanup());

describe('Verify screen content', () => {
    test('Language = English.', () => runTest('en'));
    test('Language = Chinese.', () => runTest('zh'));
    test('Language = Japanese.', () => runTest('ja'));
    /**
     * Runs a test case on the screen content.
     * @param {string} language language code
     */
    const runTest = (language) => {
        i18n.changeLanguage(language);
        testUtils.environmentFixture('REACT_APP_VERSION').mock("1.0.0");

        render(<About />);
        expect(document.querySelector('#about')).toBeInTheDocument();
        expect(testUtils.getHeading(1, expecteds.about.title[language])).toBeInTheDocument();
        expect(testUtils.getHeading(1))
        testUtils.assertTableRowCount(2);
        testUtils.assertTableCells([
            [expecteds.about.fieldLabel.version[language], ':', 'v1.0.0'],
            [expecteds.about.fieldLabel.author[language], ':', 'Cecilia Wong']
        ], 2, 3);
    }
});