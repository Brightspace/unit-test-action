'use strict';

const { readFile, extractJSON } = require('../helpers');
const { Annotations } = require('../annotations');
// const { Annotation } = require('../annotation');

class Karma {
	static updateTestCommand(command, fileOutput) {
		// Add `-R json` to format result as a json
		command = command.replace('karma', 'karma --reporters json');

		// Add `| tee` to output stdout to a file
		return `/bin/bash -c "${command} | tee ${fileOutput}"`;
	}

	static parseTestResult(fileOutput) {
		const output = extractJSON(readFile(fileOutput));
		console.log(output);

		const annotations = new Annotations({
			numErrors: 0
		});

		// if (output) {
		// 	output.failures.forEach(failure => {
		// 		const fileName = failure.file.substring(process.env.GITHUB_WORKSPACE.length + 1, failure.file.length);

		// 		annotations.annotations.push(new Annotation({
		// 			title: failure.fullTitle,
		// 			message: `${failure.err.message}\n\n${failure.err.stack}`,
		// 			path: fileName,
		// 			line: this._getLineNumber(failure.err.stack, fileName)
		// 		}));
		// 	});
		// }

		return annotations;
	}
}

module.exports = {
	Karma
};
