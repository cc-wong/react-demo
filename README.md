# React Demo

**Wiki page:** <https://github.com/cc-wong/react-demo/wiki>

A simple demo on building a webapp with React JS.

This app allows you to look up the schedules of the Grand Sumo Tournament in the current year and the next 20 years.

1. An API call is made to endpoint `/getSumoHonbashoSchedule` of the webservice from [Python Webservice Demo](https://github.com/cc-wong/python-webservice-demo). The year argument is provided by a dropdown field.
2. The JSON data returned by the API call is populated to the frontend.

> [!NOTE]
> This app calls the local instance of the Python Webservice Demo webservice.\
> Please refer to [its GitHub page](https://github.com/cc-wong/python-webservice-demo)
> on how to set up and start it at your local mahine.

URL: <http://localhost:3000/>

## Deployment and startup

### Run locally
1. Go to the project root directory at the terminal.
2. `npm install` (only required for the first time)
3. `npm start`

## Unit testing

Run `npm test`.
* Tests will be rerun whenever a file is updated.
* Press `Ctrl+C` to exit.