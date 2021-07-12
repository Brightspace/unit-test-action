'use strict';

const fs = require('fs');

function readFile(file) {
	return fs.readFileSync(file, 'utf8');
}

function hasProperties(obj, properties) {
	let hasProperty = true;

	properties.forEach(property => {
		if (!(property in obj)) {
			hasProperty = false;
		}
	});

	return hasProperty;
}

function extractJSON(str, properties = []) {
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

				if (hasProperties(res, properties)) {
					return res;
				}
			}
			catch (ignore) { /*ignore*/ }

			firstClose = str.substr(0, firstClose).lastIndexOf('}');
		} while (firstClose > firstOpen);

		firstOpen = str.indexOf('{', firstOpen + 1);
	} while (firstOpen !== -1);
}

function getTestCommand(originalCommand) {
	const packageConfig = JSON.parse(readFile('package.json'));

	let command = packageConfig.scripts[originalCommand].split(' ');

	command = parseSequentialCommand(command);

	command.unshift('npx');

	for (let i = 0; i < command.length; i++) {
		if (command[i] === '&&') {
			command.splice(i + 1, 0, 'npx');
		}
	}

	while (command.includes('npm')) {
		const startIndex = command.indexOf('npm');
		const endIndex = command[startIndex + 1] === 'run' ? startIndex + 2 : startIndex + 1;
		command.splice(startIndex, endIndex - startIndex + 1, ...packageConfig.scripts[command[endIndex]].split(' '));
	}

	return command.join(' ');
}

function parseSequentialCommand(command) {
	if (command[0] === 'run-s') {
		const seqCommands = [];

		command.forEach(script => {
			if (script !== 'run-s' && !script.startsWith('-')) {
				seqCommands.push(`npm run ${script}`);
			}
		});

		return seqCommands.join(' && ').split(' ');
	}

	return command;
}

module.exports = {
	readFile,
	extractJSON,
	getTestCommand
};
