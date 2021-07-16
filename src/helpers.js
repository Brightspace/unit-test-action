'use strict';

const fs = require('fs');

class Helpers {
	static readFile(file) {
		return fs.readFileSync(file, 'utf8');
	}

	static hasAllProperties(obj, properties) {
		let hasProperty = true;

		properties.forEach(property => {
			if (!(property in obj)) {
				hasProperty = false;
			}
		});

		return hasProperty;
	}

	static extractJSON(str, properties = []) {
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

					if (Helpers.hasAllProperties(res, properties)) {
						return res;
					}
				}
				catch (ignore) { /*ignore*/ }

				firstClose = str.substr(0, firstClose).lastIndexOf('}');
			} while (firstClose > firstOpen);

			firstOpen = str.indexOf('{', firstOpen + 1);
		} while (firstOpen !== -1);

		return null;
	}

	static getTestCommand(originalCommand) {
		const packageConfig = JSON.parse(Helpers.readFile('package.json'));

		let command = packageConfig.scripts[originalCommand].split(' ');

		command = Helpers._parseSequentialCommand(command);

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

	static _parseSequentialCommand(command) {
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
}

module.exports = {
	Helpers
};
