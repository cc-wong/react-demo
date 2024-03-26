import { render, screen, cleanup } from '@testing-library/react';
import YearDropdown from '../components/YearDropdown';

// afterEach function runs after each test suite is executed
afterEach(() => {
    cleanup();
})

test('<YearDropdown /> rendered', () => {
    render(<YearDropdown />);
    const dropdown = screen.getByLabelText("Year");
    expect(dropdown).toHaveAttribute("id", "year");
    expect(dropdown).toHaveAttribute("name", "year");

    const thisYear = (new Date()).getFullYear();
    const options = screen.getAllByRole('option');

    const numOfOptions = 21;
    expect(options.length).toBe(numOfOptions);
    for (var i = 0; i < numOfOptions; i++) {
        const year = (thisYear + i).toString();
        expect(options.at(i)).toHaveAttribute("value", year);
        expect(screen.getByRole("option", { name: year })).toBeInTheDocument();
    }


    // console.log(Array(20))
});
