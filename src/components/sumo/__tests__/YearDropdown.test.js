import { render, screen, cleanup } from '@testing-library/react';
import * as utils from '../../../testUtils';

import YearDropdown from '../YearDropdown';

import i18n from '../../../i18n';
import { I18nextProvider } from 'react-i18next';

beforeEach(() => utils.mockCurrentDate('2022-03-28'));
afterEach(() => cleanup());

describe('Verify screen', () => {
    test('Label text is correct - English.', () => testLabel('en', 'Year'));
    test('Label text is correct - Chinese.', () => testLabel('zh', '年份'));
    test('Label text is correct - Japanese.', () => testLabel('ja', '年'));

    /**
     * Runs a test case on the label text.
     * @param {string} languageCode the language code
     * @param {string} expected the expected label text
     */
    const testLabel = (languageCode, expected) => {
        i18n.changeLanguage(languageCode);
        render(
            <I18nextProvider i18n={i18n}>
                <YearDropdown selectedYear={2022} />
            </I18nextProvider>);
        expect(getDropdown()).toBe(screen.getByLabelText(expected));
    }

    const optionsTextDefault = ['2018',
        '2019', '2020', '2021', '2022', '2023',
        '2024', '2025', '2026', '2027', '2028'];
    const optionsTextJapanese = ['平成30年 (2018)',
        '平成31年/令和元年 (2019)', '令和2年 (2020)', '令和3年 (2021)', '令和4年 (2022)', '令和5年 (2023)',
        '令和6年 (2024)', '令和7年 (2025)', '令和8年 (2026)', '令和9年 (2027)', '令和10年 (2028)'];

    test('Field is rendered - English.', () => testFieldRendered('en', optionsTextDefault));
    test('Field is rendered - Chinese.', () => testFieldRendered('zh', optionsTextDefault));
    test('Field is rendered - Japanese.', () => testFieldRendered('ja', optionsTextJapanese));
    /**
     * Tests that the dropdown box is rendered correctly.
     * @param {string} language the language code
     * @param {string[]} optionsText the expected texts of the dropdown options
     */
    const testFieldRendered = (language, optionsText) => {
        i18n.changeLanguage(language);
        utils.mockCurrentDate('2018-03-28')
        const selectedYear = 2027;

        render(<YearDropdown selectedYear={selectedYear} />);
        expect(getDropdown()).toBeInTheDocument();

        const options = screen.getAllByRole('option');
        expect(options.length).toBe(10 + 1);
        expect(options.map((option) => option.innerHTML)).toEqual(optionsText);
        options.map((option, i) => {
            var year = 2018 + i;
            expect(option).toHaveAttribute("value", year.toString());
            try {
                expect(option.selected).toBe(year === selectedYear);
            } catch (e) {
                throw new Error(
                    `Option "${year}" should ${year === selectedYear ? '' : "not "}be selected!`
                );
            }
        });
    }
});

describe('Actions on the dropdown box', () => {
    test('onChange event called on value change.', () => {
        const mockOnChangeEvent = jest.fn();
        render(<YearDropdown onChangeEvent={mockOnChangeEvent} />);
        const dropdown = getDropdown();
        utils.fireChangeDropdownValueEvent(dropdown, '2029');
        expect(mockOnChangeEvent.mock.calls).toHaveLength(1);
    });
});

/**
 * Gets the Year dropdown box component.
 * @returns the HTML component for the dropdown box
 */
const getDropdown = () => utils.getDropdownBoxElement('year');