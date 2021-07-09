'use strict';

const { Mocha } = require('./frameworks/mocha');

const frameworks = {
	'mocha': Mocha
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
