'use strict';

const core = require('@actions/core');
const exec = require('@actions/exec');

const { TestFrameworkFactory } = require('./testFrameworkFactory');
const { Checks } = require('./checks');
const { getTestCommand } = require('./helpers');

const FILE_OUTPUT = 'output.json';

async function main() {
	try {
		const testType = core.getInput('test-type');
		const testScript = core.getInput('test-script');

		const framework = TestFrameworkFactory.getTestFramework(testType);

		let testCommand = getTestCommand(testScript);

		testCommand = framework.updateTestCommand(testCommand, FILE_OUTPUT);

		await exec.exec(testCommand);

		const annotations = framework.parseTestResult(FILE_OUTPUT);

		if (annotations.annotations.length > 0) {
			await Checks.writeAnnotations(annotations);
		}
	} catch (error) {
		console.error(error);
		core.setFailed(error.message);
	}
}

main();
