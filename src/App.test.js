import { render, screen, cleanup } from '@testing-library/react';
import App from './App';

// afterEach function runs after each test suite is executed
afterEach(() => {
  cleanup();
});

test('Heading is present.', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading).toHaveTextContent("Grand Sumo Tournament Schedule");
});

test('Year dropdown is present.', () => {
  render(<App />);
  expect(screen.getByRole('combobox')).toHaveAttribute("name", "year");

  var currentYear = (new Date()).getFullYear();
  expect(screen.getByRole('option', { name: currentYear }).selected).toBe(true);
});

test('Schedule table is present.', () => {
  render(<App />);
  expect(screen.getByRole('table')).toHaveAttribute("name", "schedule");
});