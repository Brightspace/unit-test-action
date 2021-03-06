'use strict';

const { Helpers } = require('../helpers');
const { Annotations } = require('../annotations');
const { Annotation } = require('../annotation');

const EXPECTED_ARGUMENTS = ['browsers', 'result', 'summary'];

class Karma {
	static updateTestCommand(command, fileOutput) {
		// Add `-R json` to format result as a json
		command = command.replace('karma', 'karma --reporters json');

		// Add `| tee` to output stdout to a file
		return `/bin/bash -c "${command} | tee ${fileOutput}"`;
	}

	static parseTestResult(fileOutput) {
		const output = Helpers.extractJSON(Helpers.readFile(fileOutput), EXPECTED_ARGUMENTS);

		const annotations = new Annotations({
			numErrors: output.summary.failed
		});

		if (output && output.summary.failed > 0) {

			for (const [id, results] of Object.entries(output.result)) {

				results.forEach(result => {

					if (!result.success) {
						const logs = result.log.join('\n');
						const { path, line } = Karma._getFileInfo(logs);
						const title = `${result.description} (${output.browsers[id].name})`;

						annotations.annotations.push(new Annotation({
							title,
							message: `${result.suite.join('.')}: ${title}:\n\n${result.log.join('\n')}`,
							path,
							line
						}));
					}
				});
			}
		}

		return annotations;
	}

	static _getFileInfo(stack) {

		// Matching on: `base/{filePath}:{lineNumber}`
		const matches = stack.match(/base\/.+\.test\.js.*:\d+/g);

		if (matches && matches.length > 0) {
			const match = matches[0];

			// Using lookbehind (?<=foo) and lookahead (?=foo) to get file path and line number
			return {
				path: match.match(/(?<=base\/).+\.test\.js/g)[0],
				line: parseInt(match.match(/(?<=\.test\.js.*:)\d+/g)[0])
			};
		}
		return {
			path: 'package.json',
			line: 1
		};
	}
}

module.exports = {
	Karma
};
