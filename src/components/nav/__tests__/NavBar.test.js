import { render, screen, cleanup } from '@testing-library/react';
import NavBar from '../NavBar';

import i18n from '../../../i18n';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

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
  /**
   * Tackling the "TypeError: Cannot destructure property 'future' of..." error
   * when running unit tests on components with `<NavLink>`:
   * https://medium.com/@ibraheemosule/tackling-the-navlink-error-in-jest-e57679eab16f
   */
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter><NavBar /></MemoryRouter>
    </I18nextProvider>);
  return screen.getByRole('navigation');
}