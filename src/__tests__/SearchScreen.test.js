import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SearchScreen from '../components/SearchScreen';


// afterEach function runs after each test suite is executed
afterEach(() => {
    cleanup();
});

test('<SearchScreen /> rendered', () => {
    render(<SearchScreen />);
    expect(screen.getByRole('combobox')).toHaveAttribute("name", "year");

    var currentYear = (new Date()).getFullYear();
    expect(screen.getByRole('option', { name: currentYear }).selected).toBe(true);
    expect(screen.getByRole('table')).toHaveAttribute("name", "schedule");
});

test('Assert year dropdown onChange event.', () => {
    render(<SearchScreen />);
    const yearDropdown = screen.getByRole('combobox');

    var changedYear = (new Date()).getFullYear() + 3;
    fireEvent.change(yearDropdown, {
        target: { value: changedYear.toString() }
    });
});