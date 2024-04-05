import { render, screen, cleanup } from '@testing-library/react';
import App from '../App';

describe('Test cases on the components in the app screen', () => {
  afterEach(() => cleanup());

  test('Title is present.', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent("Grand Sumo Tournament Schedule");
  });

  test('Search screen components are present.', () => {
    render(<App />);
    expect(screen.getByText("Year")).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'year' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'schedule' })).toBeInTheDocument();
  });

  test('Fail test case.', () => {
    expect(1 + 1).toBe(3);
  });
});
