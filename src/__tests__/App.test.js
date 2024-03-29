import { render, screen, cleanup } from '@testing-library/react';
import App from '../App';

describe('Main app component', () => {
  afterEach(() => {
    cleanup();
  });

  test('Heading is present.', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent("Grand Sumo Tournament Schedule");
  });

});
