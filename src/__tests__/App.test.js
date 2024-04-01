import { render, screen, cleanup } from '@testing-library/react';
import App from '../App';

describe('Test cases on the components in the app screen', () => {
  const environmentUtils = require('../utils/EnvironmentUtils');
  const spyIsRemoteApi = jest.spyOn(environmentUtils, 'isRemoteApi');

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

  describe('Remark for remote API', () => {
    test('Is displayed.', () => {
      spyIsRemoteApi.mockReturnValue(true);
      render(<App />);

      const errorMessageBox = document.querySelector('#remoteApiRemark');
      expect(errorMessageBox).toBeInTheDocument();

      expect(errorMessageBox.innerHTML).toBe("Note:<br>" +
        "The API service used here will spin down after some time of inactivity," +
        " and will need time to start up again when called." +
        " In such a case it can take up to 50 seconds to load data," +
        " but subsequent queries made shortly afterwards should be quick.<br>" +
        "If loading is stuck for significantly more than a minute," +
        " reload the page to re-trigger the API call.");
    });

    test('Is not displayed.', () => {
      spyIsRemoteApi.mockReturnValue(false);
      render(<App />);

      const errorMessageBox = document.querySelector('#remoteApiRemark');
      expect(errorMessageBox).toBeNull();
    });
  })
});
