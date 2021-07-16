'use strict';

const { Helpers } = require('../src/helpers');

const { expect } = require('chai');
const sinon = require('sinon');

describe('Helper functions', () => {
	describe('hasAllProperties', () => {
		it('Returns true when it has only the properties passed', () => {
			const obj = {
				field1: 'test1',
				field2: 'test2'
			};

			expect(Helpers.hasAllProperties(obj, ['field1', 'field2'])).to.be.true;
		});

		it('Returns true when it has the properties passed and some other', () => {
			const obj = {
				field1: 'test1',
				field2: 'test2',
				field3: 'test3'
			};

			expect(Helpers.hasAllProperties(obj, ['field1', 'field2'])).to.be.true;
		});

		it('Returns true when no properties checked', () => {
			const obj = {
				field1: 'test1',
				field2: 'test2'
			};

			expect(Helpers.hasAllProperties(obj, [])).to.be.true;
		});

		it('Returns false when it is missing some properties', () => {
			const obj = {
				field1: 'test1',
				field2: 'test2'
			};

			expect(Helpers.hasAllProperties(obj, ['field1', 'field2', 'field3'])).to.be.false;
		});

		it('Returns false when there are none of the properties', () => {
			const obj = {
				fake1: 'test1',
				fake2: 'test2'
			};

			expect(Helpers.hasAllProperties(obj, ['field1', 'field2'])).to.be.false;
		});
	});
});

describe('Extract JSON', () => {
	it('Able to extract when there is only a JSON', () => {
		const json = {
			field1: 'test1',
			field2: 'test2'
		};

		const text = JSON.stringify(json);

		expect(Helpers.extractJSON(text)).to.deep.equal(json);
	});

	it('Able to extract when there is JSON and text', () => {
		const json = {
			field1: 'test1',
			field2: 'test2'
		};

		const text = `More text${JSON.stringify(json)}More text`;

		expect(Helpers.extractJSON(text)).to.deep.equal(json);
	});

	it('Able to extract when there is multiple JSONs', () => {
		const json = {
			field1: 'test1',
			field2: 'test2'
		};

		const ignoredJson = {
			fake1: 'test1',
			field2: 'test2'
		};

		const text = `${JSON.stringify(ignoredJson)}${JSON.stringify(json)}`;

		expect(Helpers.extractJSON(text, ['field1', 'field2'])).to.deep.equal(json);
	});

	it('Returns null when there is no json', () => {
		const text = 'Just text';

		expect(Helpers.extractJSON(text)).to.deep.equal(null);
	});

	it('Returns null when there is no valid JSON', () => {
		const text = `
		{
			"field1": "test1",
			"field2": "test2",
			"field3": {
				"fake1"
			}
		}
		`;

		expect(Helpers.extractJSON(text)).to.deep.equal(null);
	});

	it('Returns null when there is no matching JSON', () => {
		const json = {
			field1: 'test1',
			field2: 'test2'
		};

		const text = JSON.stringify(json);

		expect(Helpers.extractJSON(text, ['fake1', 'field2'])).to.deep.equal(null);
	});
});

describe('Parsing test command', () => {
	afterEach(() => {
		sinon.restore();
	});

	it('Able to get simple command', () => {
		const command = 'mocha';
		const commandTitle = 'test';

		sinon.stub(Helpers, 'readFile').returns(`{
			"scripts": {
				"${commandTitle}": "${command}"
			}
		}`);

		expect(Helpers.getTestCommand(commandTitle)).to.equal(`npx ${command}`);
	});

	it('Able to get command and replace a npm command', () => {
		const command = 'mocha';
		const commandTitle = 'test';

		sinon.stub(Helpers, 'readFile').returns(`{
			"scripts": {
				"${commandTitle}": "npm lint",
				"lint": "${command}"
			}
		}`);

		expect(Helpers.getTestCommand(commandTitle)).to.equal(`npx ${command}`);
	});

	it('Able to get command and replace a npm run command', () => {
		const command = 'mocha';
		const commandTitle = 'test';

		sinon.stub(Helpers, 'readFile').returns(`{
			"scripts": {
				"${commandTitle}": "npm run lint",
				"lint": "${command}"
			}
		}`);

		expect(Helpers.getTestCommand(commandTitle)).to.equal(`npx ${command}`);
	});

	it('Able to get command and replace multiple layers of npm commands', () => {
		const command = 'mocha';
		const commandTitle = 'test';

		sinon.stub(Helpers, 'readFile').returns(`{
			"scripts": {
				"${commandTitle}": "npm run lint",
				"lint": "npm run test:code",
				"test:code": "${command}"
			}
		}`);

		expect(Helpers.getTestCommand(commandTitle)).to.equal(`npx ${command}`);
	});

	it('Able to get command with multiple sequential commands', () => {
		const command1 = 'mocha';
		const command2 = 'nyc';
		const commandTitle = 'test';

		sinon.stub(Helpers, 'readFile').returns(`{
			"scripts": {
				"${commandTitle}": "${command1} && ${command2}"
			}
		}`);

		expect(Helpers.getTestCommand(commandTitle)).to.equal(`npx ${command1} && npx ${command2}`);
	});

	it('Able to get and modify run-s command', () => {
		const command1 = 'mocha';
		const command2 = 'eslint';
		const commandTitle = 'test';

		sinon.stub(Helpers, 'readFile').returns(`{
			"scripts": {
				"${commandTitle}": "run-s lint test:code",
				"lint": "${command2}",
				"test:code": "${command1}"
			}
		}`);

		expect(Helpers.getTestCommand(commandTitle)).to.equal(`npx ${command2} && npx ${command1}`);
	});
});

