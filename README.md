# Create-React-App-Env
## Description
This Github Action generates a local .env file in a github runner for react apps, by extracting environment variables from your secrets or custom defined object, that match the prefix "REACT_APP"
## How to Use:
Below is an example of an appropriate configuration 
```
name: Create Env
uses: aasmal97/create-react-app-env
with: 
  REACT_APP_SECRETS: ${{toJson(secrets)}}
```
## Inputs
- `REACT_APP_SECRETS`: Takes in a stringified JSON object that holds all your secrets or variables
