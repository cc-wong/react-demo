import { render, screen, cleanup } from '@testing-library/react';
import YearDropdown from '../components/YearDropdown';

// afterEach function runs after each test suite is executed
afterEach(() => {
    cleanup();
})

test('<YearDropdown /> rendered', () => {
    const thisYear = (new Date()).getFullYear();
    const selectedYear = thisYear + 3;

    render(<YearDropdown selectedYear={selectedYear} />);
    const dropdown = screen.getByLabelText("Year");
    expect(dropdown).toHaveAttribute("id", "year");
    expect(dropdown).toHaveAttribute("name", "year");

    const options = screen.getAllByRole('option');
    expect(options.length).toBe(20 + 1);
    options.map((option, i) => {
        var year = thisYear + i;
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
