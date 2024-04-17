import { render, screen, fireEvent, cleanup, queryByRole } from '@testing-library/react';
import LanguageSelector from '../LanguageSelector';

import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';

afterEach(() => cleanup());

test('Language selector button appearance.', () => {
    const { container, toggleButton } = renderComponent();
    const icon = container.querySelector('svg', { name: 'LanguageSelectorIcon' });
    expect(toggleButton).toContainElement(icon);
    expect(toggleButton).toHaveTextContent('Language: EN');
});

test('Expand and collapse selector menu.', () => {
    const { toggleButton } = renderComponent();

    fireEvent.click(toggleButton);
    const options = screen.getAllByRole('menuitem');
    expect(options.map((option) => option.textContent.trim())).toEqual(['English', '中文', '日本語']);
    expect(options.at(0)).toBeDisabled();
    expect(options.at(1)).not.toBeDisabled();
    expect(options.at(2)).not.toBeDisabled();

    fireEvent.click(toggleButton);
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
})

test('Change language.', () => {
    const { toggleButton } = renderComponent();
    const moment = require('moment');
    const spyMomentLocale = jest.spyOn(moment, 'locale');

    fireEvent.click(toggleButton);
    fireEvent.click(screen.getAllByRole('menuitem').at(1));
    expect(toggleButton).toHaveTextContent('Language: ZH');
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    expect(spyMomentLocale).toHaveBeenCalledWith('zh-hk');

    fireEvent.click(toggleButton);
    const options = screen.getAllByRole('menuitem');
    expect(options.at(0)).not.toBeDisabled();
    expect(options.at(1)).toBeDisabled();
    expect(options.at(2)).not.toBeDisabled();
})

/**
 * Renders the component for testing.
 * @returns {{container: HTMLElement, toggleButton: HTMLElement}}
 *          the container the component is rendered into and the menu toggle button
 */
const renderComponent = () => {
    const { container } = render(
        <I18nextProvider i18n={i18n}>
            <LanguageSelector />
        </I18nextProvider>
    );
    const toggleButton = screen.getByRole('button');
    return { container, toggleButton };
}