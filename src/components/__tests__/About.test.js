import { cleanup, render, screen } from "@testing-library/react";
import * as testUtils from '../../testUtils';
import i18n from '../../i18n';

import About from '../About';

afterEach(() => cleanup());

describe('Verify screen content', () => {
    test('Language = English.', () => runTest('en', 'Version', 'Author'));
    test('Language = Chinese.', () => runTest('zh', '版本', '作者'));
    test('Language = Japanese.', () => runTest('ja', 'バージョン番号', '著者'));
    /**
     * Runs a test case on the screen content.
     * @param {string} language language code
     * @param {string} versionLabel expected label text for the Version field
     * @param {string} authorLabel expected label text for the Author field
     */
    const runTest = (language, versionLabel, authorLabel) => {
        i18n.changeLanguage(language);
        testUtils.environmentFixture('REACT_APP_VERSION').mock("1.0.0");

        render(<About />);
        expect(document.querySelector('#about')).toBeInTheDocument();

        expect(screen.getAllByRole('row')).toHaveLength(2);
        testUtils.assertTableCells([
            [versionLabel, ':', 'v1.0.0'],
            [authorLabel, ':', 'Cecilia Wong']
        ], 2, 3);
    }
});