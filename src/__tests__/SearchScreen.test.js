import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SearchScreen from '../components/SearchScreen';

beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-10-10'));
});
afterEach(() => {
    cleanup();
});

test('<SearchScreen /> rendered', () => {
    render(<SearchScreen />);
    expect(screen.getByRole('combobox')).toHaveAttribute("name", "year");

    expect(screen.getByRole('option', { name: 2025 }).selected).toBe(true);
    expect(screen.getByRole('table')).toHaveAttribute("name", "schedule");
});

test('Assert year dropdown onChange event.', () => {
    render(<SearchScreen />);
    const yearDropdown = screen.getByRole('combobox');

    var changedYear = 2028;
    fireEvent.change(yearDropdown, {
        target: { value: changedYear.toString() }
    });
    expect(screen.getByRole('option', { name: changedYear }).selected).toBe(true);
});