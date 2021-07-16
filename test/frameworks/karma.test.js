'use strict';

const { Karma } = require('../../src/frameworks/karma');
const { Helpers } = require('../../src/helpers');

const { expect } = require('chai');
const sinon = require('sinon');

describe('Karma', () => {

	describe('updateTestCommand', () => {
		it('Returns same command', () => {
			const command = 'ls';
			const fileOutput = 'output.json';

			expect(Karma.updateTestCommand(command, fileOutput))
				.to.equal(`/bin/bash -c "${command} | tee ${fileOutput}"`);
		});

		it('Returns modified command', () => {
			const fileOutput = 'output.json';

			expect(Karma.updateTestCommand('karma', fileOutput))
				.to.equal(`/bin/bash -c "karma --reporters json | tee ${fileOutput}"`);
		});
	});

	describe('parseTestResult', () => {
		const ANNOTATION_TITLE = 'Some unit test(s) have failed';
		const ANNOTATION_SUMMARY = 'failure(s) were found';

		beforeEach(() => {
			sinon.stub(Helpers, 'readFile');
		});

		afterEach(() => {
			sinon.restore();
		});

		it('Parses no errors', () => {
			sinon.stub(Helpers, 'extractJSON').returns({
				summary: {
					failed: 0
				}
			});

			const result = Karma.parseTestResult('');

			expect(result.title).to.equal(ANNOTATION_TITLE);
			expect(result.summary).to.equal(`0 ${ANNOTATION_SUMMARY}`);
			expect(result.annotations.length).to.equal(0);
		});

		it('Parses 1 error', () => {
			const line = 42;
			const filePath = 'test/somewhere/here.test.js';
			const title = 'error title';
			const error_message = 'error message';
			const error_stack = 'ImaginaryException: Error happened';
			const browser_name = 'Chrome';
			const suite = [
				'functionTested',
				'Use Case'
			];

			sinon.stub(Karma, '_getFileInfo').returns({
				path: filePath,
				line
			});

			sinon.stub(Helpers, 'extractJSON').returns({
				summary: {
					failed: 1
				},
				browsers: {
					123: {
						name: browser_name
					}
				},
				result: {
					123: [
						{
							success: true
						}, {
							success: false,
							log: [error_message, error_stack],
							suite,
							description: title
						}, {
							success: true
						}
					]
				}
			});

			const result = Karma.parseTestResult('');

			expect(result.title).to.equal(ANNOTATION_TITLE);
			expect(result.summary).to.equal(`1 ${ANNOTATION_SUMMARY}`);
			expect(result.annotations.length).to.equal(1);

			expect(result.annotations[0].path).to.equal(filePath);
			expect(result.annotations[0].start_line).to.equal(line);
			expect(result.annotations[0].end_line).to.equal(line);
			expect(result.annotations[0].annotation_level).to.equal('failure');
			expect(result.annotations[0].message).to.equal(`${suite.join('.')}: ${title} (${browser_name}):\n\n${error_message}\n${error_stack}`);
			expect(result.annotations[0].title).to.equal(`${title} (${browser_name})`);
		});

		it('Parses multiple errors', () => {
			const browser_name = 'Chrome';

			const line1 = 42;
			const filePath1 = 'test/somewhere/here.test.js';
			const title1 = 'error title';
			const error_message1 = 'error message';
			const error_stack1 = 'ImaginaryException: Error happened';
			const suite1 = [
				'functionTested',
				'Use Case'
			];

			const line2 = 666;
			const filePath2 = 'test/somewhere/else/not-here.test.js';
			const title2 = 'new error title';
			const error_message2 = 'new error message';
			const error_stack2 = 'RealException: Error happened again';
			const suite2 = [
				'otherFunctionTested',
				'Better Use Case'
			];

			const fileInfoStub = sinon.stub(Karma, '_getFileInfo');

			fileInfoStub.onFirstCall().returns({
				path: filePath1,
				line: line1
			});

			fileInfoStub.onSecondCall().returns({
				path: filePath2,
				line: line2
			});

			sinon.stub(Helpers, 'extractJSON').returns({
				summary: {
					failed: 2
				},
				browsers: {
					123: {
						name: browser_name
					}
				},
				result: {
					123: [
						{
							success: true
						}, {
							success: false,
							log: [error_message1, error_stack1],
							suite: suite1,
							description: title1
						}, {
							success: false,
							log: [error_message2, error_stack2],
							suite: suite2,
							description: title2
						}
					]
				}
			});

			const result = Karma.parseTestResult('');

			expect(result.title).to.equal(ANNOTATION_TITLE);
			expect(result.summary).to.equal(`2 ${ANNOTATION_SUMMARY}`);
			expect(result.annotations.length).to.equal(2);

			expect(result.annotations[0].path).to.equal(filePath1);
			expect(result.annotations[0].start_line).to.equal(line1);
			expect(result.annotations[0].end_line).to.equal(line1);
			expect(result.annotations[0].annotation_level).to.equal('failure');
			expect(result.annotations[0].message).to.equal(`${suite1.join('.')}: ${title1} (${browser_name}):\n\n${error_message1}\n${error_stack1}`);
			expect(result.annotations[0].title).to.equal(`${title1} (${browser_name})`);

			expect(result.annotations[1].path).to.equal(filePath2);
			expect(result.annotations[1].start_line).to.equal(line2);
			expect(result.annotations[1].end_line).to.equal(line2);
			expect(result.annotations[1].annotation_level).to.equal('failure');
			expect(result.annotations[1].message).to.equal(`${suite2.join('.')}: ${title2} (${browser_name}):\n\n${error_message2}\n${error_stack2}`);
			expect(result.annotations[1].title).to.equal(`${title2} (${browser_name})`);
		});
	});

	describe('_getFileInfo', () => {
		it('Can get line number', () => {
			const filePath = 'test/somewhere/here.test.js';
			const line = 42;

			const result = Karma._getFileInfo(`
			Some error happened!/base/${filePath}:${line}:13
		`);

			expect(result.path).to.equal(filePath);
			expect(result.line).to.equal(line);
		});

		it('Can get line number when no column', () => {
			const filePath = 'test/somewhere/here.test.js';
			const line = 42;

			const result = Karma._getFileInfo(`
			Some error happened!/base/${filePath}:${line}
		`);

			expect(result.path).to.equal(filePath);
			expect(result.line).to.equal(line);
		});

		it('Defaults to line 1 of package.json if no file', () => {
			const result = Karma._getFileInfo(`
			Some error happened!/base/test/somewhere/here.js:42:13
		`);

			expect(result.path).to.equal('package.json');
			expect(result.line).to.equal(1);
		});
	});
});
