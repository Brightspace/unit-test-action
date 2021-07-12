# unit-test-action

This is a work in progress Inspiration project.

## Goals

- Run unit tests for projects (using `npm test`)
- Display failed tests as annotations to facilitate finding the cause of the errors
- Accept different testing frameworks

## How to use

Add a workflow file to your repository using the following template.

### Replacements

- `<Linux|Windows>`: the operating system which matches your build requirements
- `<mocha>`: currently we only support mocha
- `<npm script command>`: The npm script to run, without the `npm run`. (Defaults to `test`)

```
name: Test

on:
  push:
    branches: [ master ]

jobs:
  build:
    runs-on: [self-hosted, <Linux|Windows>, AWS]
    timeout-minutes: 10
    steps:
    - uses: Brightspace/third-party-actions@actions/checkout
    - uses: Brightspace/third-party-actions@actions/checkout
      with:
        repository: Brightspace/unit-test-action
        path: .github/actions/unit-test-action
        token: ${{ secrets.D2L_GITHUB_TOKEN }}
    - uses: ./.github/actions/unit-test-action
      with:
        test-type: <mocha>
        test-script: <npm script command>
        token: ${{ secrets.GITHUB_TOKEN }}
```