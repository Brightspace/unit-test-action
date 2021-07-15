'use strict';

const { Helpers } = require('../helpers');
const { Annotations } = require('../annotations');
const { Annotation } = require('../annotation');

const EXPECTED_ARGUMENTS = ['stats', 'test', 'pending', 'failures', 'passes'];

class Mocha {

	static updateTestCommand(command, fileOutput) {
		// Add `-R json` to format result as a json
		command = command.replace('mocha', 'mocha -R json');

		// Add `| tee` to output stdout to a file
		return `/bin/bash -c "${command} | tee ${fileOutput}"`;
	}

	static parseTestResult(fileOutput) {
		const output = Helpers.extractJSON(Helpers.readFile(fileOutput), EXPECTED_ARGUMENTS);

		const annotations = new Annotations({
			numErrors: output ? output.failures.length : 0
		});

		if (output) {
			output.failures.forEach(failure => {
				const fileName = failure.file.substring(process.env.GITHUB_WORKSPACE.length + 1, failure.file.length);

				annotations.annotations.push(new Annotation({
					title: failure.fullTitle,
					message: `${failure.err.message}\n\n${failure.err.stack}`,
					path: fileName,
					line: this._getLineNumber(failure.err.stack, fileName)
				}));
			});
		}

		return annotations;
	}

	static _getLineNumber(stack, fileName) {
		const fileLocation = stack.indexOf(fileName);
		const lineLocation = stack.indexOf(':', fileLocation + fileName.length) + 1;

		if (lineLocation >= 0) {
			// Find numbers starting from lineLocation
			const results = stack.substring(lineLocation, stack.length).match(/\d+/);

			return results ? parseInt(results[0]) : 1;
		}

		return 1;
	}
}

module.exports = {
	Mocha
};
