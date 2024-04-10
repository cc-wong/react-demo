# React Demo

**Wiki page:** <https://github.com/cc-wong/react-demo/wiki>

A simple demo on building a webapp with React JS.

This app allows you to look up the schedules of the Grand Sumo Tournament in the current year and the next 10 years.

1. An API call is made to endpoint `/getSumoHonbashoSchedule` of the webservice from [Python Webservice Demo](https://github.com/cc-wong/python-webservice-demo). The year argument is provided by a dropdown field.
2. The JSON data returned by the API call is populated to the frontend.

See ["Environments" in this repository's Wiki](https://github.com/cc-wong/react-demo/wiki#environments) for more information on the instances of this webapp.

## Development and testing

Reference:
* At ["Getting Started with Create React App" at this project's Wiki](https://github.com/cc-wong/react-demo/wiki/Getting-Started-with-Create-React-App#available-scripts)
* <https://create-react-app.dev/docs/getting-started#scripts>

### Run locally
Run the following command at the project root:
```
npm start
```
* Environment variables are configured by .env files in this app.
You may override them with .env*.local files at your development machine.
See [here](https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used) for details.
* They may also be [added/overridden temporarily at the start command](https://create-react-app.dev/docs/adding-custom-environment-variables/#adding-temporary-environment-variables-in-your-shell).
> [!NOTE]
> 1. Run `npm install` before starting the app for the first time.
> 2. The automatic opening of the app on startup is disabled.
> Open it manually in a browser for development testing.
>    - URL: <http://localhost:3000/>

## Unit testing
### Default
```
npm test
```
* Tests will be rerun whenever a file is updated.
* See the Watch Usage on the screen for operation.

### Run all tests
The command above runs only tests affected by updated modules
by default.

To run all test cases from the start:
```
npm run testAll
```
* Tests will be rerun whenever a file is updated.
* See the Watch Usage on the screen for operation.

### Get test coverage
```
npm run coverage
```