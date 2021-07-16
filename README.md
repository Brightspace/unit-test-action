# unit-test-action

This is a Github Action to run unit tests and display the failed tests in the `Files Changed` of PRs.

This action is a work in progress, it has been worked on during an inspiration sprint. It is not a 
completed project and has room for improvement.

## In case of problems

If the action does not work as expected or if it does not support a testing framework you would 
like to use, please open up an issue and message Louis Coste.

## Supported testing frameworks

Currently the supported testing frameworks are:

### Mocha

### Karma

In order to use this GtiHub Action with Karma you will need to add a package to your modules. 
Make sure to add `"karma-json-reporter": "^1.1"` to your `devDependencies`.

## Disclaimer

This tool uses the npm scripts and modifies them slightly to be able to parse the results.

The result is then parsed and it might not always contain the file location where errors happen.

## How to use

Add a workflow file to your repository using the following template.

- `<mocha|karma>`: Testing framework used in the `npm test` command
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
    - uses: Brightspace/unit-test-action@v1.0.0
      with:
        test-type: <mocha|karma> # Without the angle brackets
        test-script: <npm script command> # Without the angle brackets
        token: ${{ secrets.GITHUB_TOKEN }}
```

If you are using the `karma` testing framework then you also need to add 
`"karma-json-reporter": "^1.1"` to your `devDependencies`

## Versioning, Releasing & Deploying

All version changes should obey [semantic versioning](https://semver.org/) rules.

This repo uses the [semantic-release](https://github.com/BrightspaceUI/actions/tree/master/semantic-release) GitHub action to manage GitHub releases. The commit message format for initiating releases is specified in that [semantic-release](https://github.com/BrightspaceUI/actions/tree/master/semantic-release) GitHub action.

Supported commit prefixes:
| Commit prefix        | Version Increase |
| -------------------- | ---------------- |
| `fix:`               | `PATCH`          |
| `perf:`              | `PATCH`          |
| `feat:`              | `MINOR`          |
| `BREAKING CHANGE:`   | `MAJOR`          |

Example commit: `feat: Adding error page` will increment the `MINOR` version.
