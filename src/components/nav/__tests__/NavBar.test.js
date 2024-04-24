import { render, screen, cleanup, waitFor } from '@testing-library/react';
import expectedVals from '../../../testData-expecteds.json';

import NavBar from '../NavBar';

import i18n from '../../../i18n';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { fireClickButtonEvent } from '../../../testUtils';
import { act } from 'react-dom/test-utils';

afterEach(() => cleanup());

describe('Verify navigation bar content', () => {
  test('Logo exists.', () => expect(renderComponent()).toHaveTextContent('React Demo'));

  test('Language selector exists.', () => expect(renderComponent()
    .querySelector('button', { name: 'LanguageSelectorButton' })).toBeInTheDocument());

  test('Menu exists.', () => {
    renderComponent();
    const expecteds = [
      { text: expectedVals.navLinkText.sumoSchedule['en'], href: '/' },
      { text: expectedVals.navLinkText.about['en'], href: '/about' }
    ];
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(expecteds.length);
    links.forEach((link, i) => {
      expect(link).toHaveTextContent(expecteds.at(i).text);
      expect(link).toHaveAttribute('href', expecteds.at(i).href);
    });
  });

  test('Expand and close hamburger menu.', async () => {
    renderComponent();
    const hamburgerIcon = document.querySelector('#navHamburger');
    expect(hamburgerIcon).toBeInTheDocument();
    expect(getNavMenuContainer()).toHaveAttribute('class', 'NavMenu');

    act(() => fireClickButtonEvent(hamburgerIcon));
    await waitFor(() => expect(getNavMenuContainer()).toHaveAttribute('class', 'NavMenu active'));

    act(() => fireClickButtonEvent(hamburgerIcon));
    await waitFor(() => expect(getNavMenuContainer()).toHaveAttribute('class', 'NavMenu'));
  })
})

/**
 * Returns the container for the navigation menu items.
 * @returns the `<div>` element container
 */
const getNavMenuContainer = () => document.querySelector('#navMenu');

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