'use strict';

const fs = require('fs');

function readFile(file) {
	return fs.readFileSync(file, 'utf8');
}

function extractJSON(str) {
	let firstOpen, firstClose, candidate;
	firstOpen = str.indexOf('{');

	do {
		firstClose = str.lastIndexOf('}');

		if (firstClose <= firstOpen) {
			return null;
		}

		do {
			candidate = str.substring(firstOpen, firstClose + 1);

			try {
				var res = JSON.parse(candidate);

				return res;
			}
			catch (ignore) { /*ignore*/ }

			firstClose = str.substr(0, firstClose).lastIndexOf('}');
		} while (firstClose > firstOpen);

		firstOpen = str.indexOf('{', firstOpen + 1);
	} while (firstOpen !== -1);
}

function getTestCommand(originalCommand) {
	const packageConfig = JSON.parse(readFile('package.json'));

	const command = packageConfig.scripts[originalCommand].split(' ');

	while (command.includes('npm')) {
		const startIndex = command.indexOf('npm');
		const endIndex = command[startIndex + 1] === 'run' ? startIndex + 2 : startIndex + 1;
		command.splice(startIndex, endIndex - startIndex + 1, ...packageConfig.scripts[command[endIndex]].split(' '));
	}

	return command.join(' ');
}

module.exports = {
	readFile,
	extractJSON,
	getTestCommand
};
