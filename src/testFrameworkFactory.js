'use strict';

const { Mocha } = require('./frameworks/mocha');
const { Karma } = require('./frameworks/karma');

const frameworks = {
	'mocha': Mocha,
	'karma': Karma
};

class TestFrameworkFactory {
	static getTestFramework(testType) {
		if (testType in frameworks) {
			return frameworks[testType];
		}

		throw Error(`Test framework ${testType} is not supported`);
	}
}

module.exports = {
	TestFrameworkFactory
};
