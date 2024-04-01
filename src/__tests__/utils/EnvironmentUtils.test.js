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

describe('Environment variable REACT_APP_REMOTE_API', () => {
    const fixture = environmentFixture('REACT_APP_REMOTE_API');

    afterEach(() => fixture.restore());

    test('Is true (lowercase).', () => {
        fixture.mock("true");
        testIsRemoteApi(true);
    })

    test('Is true (uppercase).', () => {
        fixture.mock("TRUE");
        testIsRemoteApi(true);
    })

    test('Is true (proper case).', () => {
        fixture.mock("True");
        testIsRemoteApi(true);
    })

    test('Is false (lowercase).', () => {
        fixture.mock("false");
        testIsRemoteApi(false);
    })

    test('Is false (uppercase).', () => {
        fixture.mock("FALSE");
        testIsRemoteApi(false);
    })

    test('Is false (proper case).', () => {
        fixture.mock("False");
        testIsRemoteApi(false);
    })

    test('Is not defined.', () => {
        fixture.delete();
        testIsRemoteApi(false);
    })

    /**
     * Runs a test case on `isRemoteApi()`.
     * 
     * @param {boolean} expected the expected return value
     */
    const testIsRemoteApi = (expected) => expect(envUtils.isRemoteApi()).toBe(expected);
})