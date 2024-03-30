import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import YearDropdown from '../../components/YearDropdown';

describe('Unit tests on the year dropdown box', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date('2022-03-28'));
    });
    afterEach(() => {
        cleanup();
    })

    test('Field is rendered.', () => {
        const selectedYear = 2027;

        render(<YearDropdown selectedYear={selectedYear} />);
        const dropdown = getDropdown();
        expect(dropdown).toHaveAttribute("id", "year");
        expect(dropdown).toHaveAttribute("name", "year");

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

    /**
     * Mock onChange event for the dropdown box.
     */
    const mockOnChangeEvent = jest.fn();

    test('onChange event called on value change.', () => {
        render(<YearDropdown onChangeEvent={mockOnChangeEvent} />);
        const dropdown = getDropdown();
        fireEvent.change(dropdown, {
            target: { value: '2029' }
        });
        expect(mockOnChangeEvent.mock.calls).toHaveLength(1);
    });

    /**
     * Returns the dropdown object from the screen.
     * 
     * This function returning the object also asserts that
     * the "Year" label was implemented properly.
     * 
     * @returns the dropdown object
     */
    function getDropdown() {
        return screen.getByLabelText("Year");
    }

});