'use strict';

module.exports = {
	root: true,
	parserOptions: {
		ecmaVersion: 2020
	},
	extends: ['brightspace/node-config'],
	env: {
		mocha: true
	},
	rules: {
		'no-unused-vars': [2, { args: 'all', argsIgnorePattern: '^_' }]
	},
};
