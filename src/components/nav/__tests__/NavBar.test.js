import { render, screen, cleanup } from '@testing-library/react';
import NavBar from '../NavBar';

import i18n from '../../../i18n';
import { I18nextProvider } from 'react-i18next';

afterEach(() => cleanup());

describe('Verify navigation bar content', () => {
  test('Logo exists.', () => expect(renderComponent()).toHaveTextContent('React Demo'));
  test('Language selector exists.', () => expect(renderComponent()
    .querySelector('button', { name: 'LanguageSelectorButton' })).toBeInTheDocument());
})

/**
 * Renders the component for testing.
 * @returns the container for the items in the navigation bar, ie. the `<nav>` tag wrapper
 */
const renderComponent = () => {
  render(<I18nextProvider i18n={i18n}><NavBar /></I18nextProvider>);
  return screen.getByRole('navigation');
}
