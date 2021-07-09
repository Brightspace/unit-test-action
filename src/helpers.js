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

module.exports = {
	readFile,
	extractJSON
};
