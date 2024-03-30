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

describe('Get environment variable API_SOURCE', () => {
    const fixture = environmentFixture('REACT_APP_API_SOURCE');

    afterEach(() => fixture.restore());

    test('Environment variable present.', () => {
        fixture.mock("AZURE");
        expect(envUtils.getEnvVariableApiSource()).toBe("AZURE");
    });

    test('Environment variable missing.', () => {
        fixture.delete();
        expect(envUtils.getEnvVariableApiSource()).toBe("LOCAL");
    });
});

describe('Get API URL', () => {
    const fixture = environmentFixture('REACT_APP_API_SOURCE');

    afterEach(() => fixture.restore());

    test('Environment variable REACT_APP_API_SOURCE=LOCAL.', () => {
        fixture.mock("LOCAL");
        const baseUrl = "http://localhost:5000";
        assertApiUrl(baseUrl);
    });

    test('Environment variable REACT_APP_API_SOURCE=RENDER.', () => {
        fixture.mock("RENDER");
        const baseUrl = "https://python-webservice-demo.onrender.com";
        assertApiUrl(baseUrl);
    });

    test('Environment variable REACT_APP_API_SOURCE missing.', () => {
        fixture.delete();
        const baseUrl = "http://localhost:5000";
        assertApiUrl(baseUrl);
    });

    /**
     * Runs a test case on `getApiUrl()`.
     * 
     * @param {string} baseUrl the expected base URL
     */
    const assertApiUrl = (baseUrl) => expect(envUtils.getApiUrl())
        .toBe(baseUrl + "/getSumoHonbashoSchedule?year=%YEAR%");
})

