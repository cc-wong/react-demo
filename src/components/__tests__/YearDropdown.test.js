import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import * as utils from '../../testUtils';

import YearDropdown from '../YearDropdown';

import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';

beforeAll(() => utils.mockCurrentDate('2022-03-28'));
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

    test('Field is rendered.', () => {
        const selectedYear = 2027;

        render(<YearDropdown selectedYear={selectedYear} />);
        expect(getDropdown()).toBeInTheDocument();

        const options = screen.getAllByRole('option');
        expect(options.length).toBe(10 + 1);
        options.map((option, i) => {
            var year = 2022 + i;
            expect(option).toHaveAttribute("value", year.toString());
            expect(option).toHaveTextContent(year.toString());
            try {
                expect(option.selected).toBe(year === selectedYear);
            } catch (e) {
                throw new Error(
                    `Option "${year}" should ${year === selectedYear ? '' : "not "}be selected!`
                );
            }
        });
    });
});

describe('Actions on the dropdown box', () => {
    test('onChange event called on value change.', () => {
        const mockOnChangeEvent = jest.fn();
        render(<YearDropdown onChangeEvent={mockOnChangeEvent} />);
        const dropdown = getDropdown();
        fireEvent.change(dropdown, {
            target: { value: '2029' }
        });
        expect(mockOnChangeEvent.mock.calls).toHaveLength(1);
    });
});

/**
 * Gets the Year dropdown box component.
 * @returns the HTML component for the dropdown box
 */
const getDropdown = () => screen.getByRole('combobox', { name: 'year' });