import * as envUtils from '../../utils/EnvironmentUtils';

/**
 * Initializes a fixture for an environment variable.
 * 
 * @param {*} key the environment variable key
 * @see Mocking environment variables: <https://greenonsoftware.com/courses/react-testing-spellbook/mastering-unit-testing/mocking-environment-variables/>
 */
const environmentFixture = (key) => {
    const initValue = process.env[key];

    return {
        mock: (value) => {
            process.env[key] = value;
        },
        restore: () => {
            process.env[key] = initValue;
        },
        delete: () => {
            delete process.env[key];
        }
    }
}

test('Get app version number.', () => {
    const fixture = environmentFixture('REACT_APP_VERSION');
    fixture.mock("1.0.0");
    expect(envUtils.getAppVersionNumber()).toBe("1.0.0");
})

describe('Get API URL', () => {
    const fixture = environmentFixture('REACT_APP_API_BASE_URL');

    afterEach(() => fixture.restore());

    test('Environment variable REACT_APP_API_BASE_URL is present.', () => {
        fixture.mock("https://my-api-host.net");
        expect(envUtils.getApiUrl())
            .toBe("https://my-api-host.net/getSumoHonbashoSchedule?year=%YEAR%");
    });

    test('Environment variable REACT_APP_API_BASE_URL missing.', () => {
        fixture.delete();
        assertThrowException();
    });

    test('Environment variable REACT_APP_API_BASE_URL is empty.', () => {
        fixture.mock('');
        assertThrowException();
    });

    /**
     * Asserts that an exception is thrown.
     */
    const assertThrowException = () => expect(() => { envUtils.getApiUrl(); })
        .toThrow("REACT_APP_API_BASE_URL must be provided!");
})