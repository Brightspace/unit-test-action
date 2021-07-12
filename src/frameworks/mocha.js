'use strict';

const { readFile, extractJSON } = require('../helpers');
const { Annotations } = require('../annotations');
const { Annotation } = require('../annotation');

class Mocha {
	static updateTestCommand(command, fileOutput) {
		// Add `-R json` to format result as a json
		command = command.replace('mocha', 'mocha -R json');

		// Add `| tee` to output stdout to a file
		return `/bin/bash -c "npx ${command} | tee ${fileOutput}"`;
	}

	static parseTestResult(fileOutput) {
		const output = extractJSON(readFile(fileOutput));

		const annotations = new Annotations({
			numErrors: output ? output.failures.length : 0
		});

		if (output) {
			output.failures.forEach(failure => {
				annotations.annotations.push(new Annotation({
					title: failure.fullTitle,
					message: `${failure.err.message}\n\n${failure.err.stack}`,
					path: failure.file.substring(process.env.GITHUB_WORKSPACE.length + 1, failure.file.length),
					line: this._getLineNumber(failure.err.stack, failure.file)
				}));
			});
		}

		return annotations;
	}

	static _getLineNumber(stack, fileName) {
		const fileLocation = stack.indexOf(fileName);
		const lineLocation = stack.indexOf(':', fileLocation + fileName.length) + 1;
		const endLineLocation = stack.indexOf(':', fileLocation + fileName.length + 1);

		return parseInt(stack.substring(lineLocation, endLineLocation));
	}
}

module.exports = {
	Mocha
};
