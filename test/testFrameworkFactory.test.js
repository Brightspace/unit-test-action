'use strict';

const { TestFrameworkFactory } = require('../src/testFrameworkFactory');
const { expect } = require('chai');

describe('Framework Factory', () => {
	it('Gets proper test framework', () => {
		const mochaFramework = TestFrameworkFactory.getTestFramework('mocha');

		expect(mochaFramework.name).to.equal('Mocha');

		const karmaFramework = TestFrameworkFactory.getTestFramework('karma');

		expect(karmaFramework.name).to.equal('Karma');
	});

	it('Does not find test framework', () => {
		const fakeFramework = 'fake';

		expect(() => TestFrameworkFactory.getTestFramework(fakeFramework))
			.to.throw(Error, fakeFramework);
	});
});
