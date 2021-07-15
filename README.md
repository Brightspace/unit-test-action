# unit-test-action

This is a work in progress Inspiration project.

## Goals

- Run unit tests for projects (using `npm test`)
- Display failed tests as annotations to facilitate finding the cause of the errors
- Accept different testing frameworks

## How to use

Add a workflow file to your repository using the following template.

### Replacements

- `<mocha>`: Currently we only support mocha
- `<npm script command>`: The npm script to run, without the `npm run`. (Defaults to `test`)

```
name: Test

on:
  push:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
    - uses: Brightspace/third-party-actions@actions/checkout
    - uses: Brightspace/unit-test-action@v0.0.1
      with:
        test-type: <mocha> # Without the angle brackets
        test-script: <npm script command> # Without the angle brackets
        token: ${{ secrets.GITHUB_TOKEN }}
```