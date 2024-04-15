import { render, screen, fireEvent, cleanup, queryByRole } from '@testing-library/react';
import LanguageSelector from '../LanguageSelector';

afterEach(() => cleanup());

test('Verify screen content.', () => {
    const { container, toggleButton } = renderComponent();
    const icon = container.querySelector('svg')
    expect(toggleButton).toContainElement(icon);
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

/**
 * Renders the component for testing.
 * @returns {{container: HTMLElement, toggleButton: HTMLElement}}
 *          the container the component is rendered into and the menu toggle button
 */
const renderComponent = () => {
    const { container } = render(<LanguageSelector />);
    const toggleButton = screen.getByRole('button');
    return { container, toggleButton };
}