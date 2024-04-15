import { render, screen, cleanup } from '@testing-library/react';
import NavBar from '../NavBar';

afterEach(() => cleanup());

describe('Verify navigation bar content', () => {
  test('Logo exists.', () => {
    render(<NavBar />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveTextContent('React Demo');
  });

  test('Language selector exists.', () => {
    render(<NavBar />);
    const nav = screen.getByRole('navigation');

    const languageToggleButton = nav.querySelector('button');
    const languageIcon = nav.querySelector('svg');
    expect(nav.querySelector('svg')).toBeInTheDocument();
    expect(languageToggleButton).toContainElement(languageIcon);
  });
})