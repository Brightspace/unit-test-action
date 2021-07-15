'use strict';

const { Mocha } = require('../../src/frameworks/mocha');
const { Helpers } = require('../../src/helpers');

const { expect } = require('chai');
const sinon = require('sinon');

describe('Mocha', () => {

	describe('updateTestCommand', () => {
		it('Returns same command', () => {
			const command = 'ls';
			const fileOutput = 'output.json';

			expect(Mocha.updateTestCommand(command, fileOutput))
				.to.equal(`/bin/bash -c "${command} | tee ${fileOutput}"`);
		});

		it('Returns modified command', () => {
			const fileOutput = 'output.json';

			expect(Mocha.updateTestCommand('mocha', fileOutput))
				.to.equal(`/bin/bash -c "mocha -R json | tee ${fileOutput}"`);
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
			delete process.env.GITHUB_WORKSPACE;
		});

		it('Parses no errors', () => {
			sinon.stub(Helpers, 'extractJSON').returns({
				failures: []
			});

			const result = Mocha.parseTestResult('');

			expect(result.title).to.equal(ANNOTATION_TITLE);
			expect(result.summary).to.equal(`0 ${ANNOTATION_SUMMARY}`);
			expect(result.annotations.length).to.equal(0);
		});

		it('Parses 1 error', () => {
			const line = 42;
			const workspace = 'somewhere/over/the/directory';
			const filePath = 'test/somewhere/here.test.js';
			const title = 'error title';
			const error_message = 'error message';
			const error_stack = 'ImaginaryException: Error happened';

			sinon.stub(Mocha, '_getLineNumber').returns(line);
			process.env.GITHUB_WORKSPACE = workspace;

			sinon.stub(Helpers, 'extractJSON').returns({
				failures: [{
					file: `${workspace}/${filePath}`,
					fullTitle: title,
					err: {
						message: error_message,
						stack: error_stack
					}
				}]
			});

			const result = Mocha.parseTestResult('');

			expect(result.title).to.equal(ANNOTATION_TITLE);
			expect(result.summary).to.equal(`1 ${ANNOTATION_SUMMARY}`);
			expect(result.annotations.length).to.equal(1);

			expect(result.annotations[0].path).to.equal(filePath);
			expect(result.annotations[0].start_line).to.equal(line);
			expect(result.annotations[0].end_line).to.equal(line);
			expect(result.annotations[0].annotation_level).to.equal('failure');
			expect(result.annotations[0].message).to.equal(`${error_message}\n\n${error_stack}`);
			expect(result.annotations[0].title).to.equal(title);
		});

		it('Parses multiple errors', () => {
			const workspace = 'somewhere/over/the/directory';

			const line1 = 42;
			const filePath1 = 'test/somewhere/here.test.js';
			const title1 = 'error title';
			const error_message1 = 'error message';
			const error_stack1 = 'ImaginaryException: Error happened';

			const line2 = 13;
			const filePath2 = 'test/somewhere/else/not-here.test.js';
			const title2 = 'new error title';
			const error_message2 = 'new error message';
			const error_stack2 = 'RealException: Error happened again';

			const lineNumberStub = sinon.stub(Mocha, '_getLineNumber');

			lineNumberStub.withArgs(sinon.match.any, filePath1).returns(line1);
			lineNumberStub.withArgs(sinon.match.any, filePath2).returns(line2);
			process.env.GITHUB_WORKSPACE = workspace;

			sinon.stub(Helpers, 'extractJSON').returns({
				failures: [{
					file: `${workspace}/${filePath1}`,
					fullTitle: title1,
					err: {
						message: error_message1,
						stack: error_stack1
					}
				},
				{
					file: `${workspace}/${filePath2}`,
					fullTitle: title2,
					err: {
						message: error_message2,
						stack: error_stack2
					}
				}]
			});

			const result = Mocha.parseTestResult('');

			expect(result.title).to.equal(ANNOTATION_TITLE);
			expect(result.summary).to.equal(`2 ${ANNOTATION_SUMMARY}`);
			expect(result.annotations.length).to.equal(2);

			expect(result.annotations[0].path).to.equal(filePath1);
			expect(result.annotations[0].start_line).to.equal(line1);
			expect(result.annotations[0].end_line).to.equal(line1);
			expect(result.annotations[0].annotation_level).to.equal('failure');
			expect(result.annotations[0].message).to.equal(`${error_message1}\n\n${error_stack1}`);
			expect(result.annotations[0].title).to.equal(title1);

			expect(result.annotations[1].path).to.equal(filePath2);
			expect(result.annotations[1].start_line).to.equal(line2);
			expect(result.annotations[1].end_line).to.equal(line2);
			expect(result.annotations[1].annotation_level).to.equal('failure');
			expect(result.annotations[1].message).to.equal(`${error_message2}\n\n${error_stack2}`);
			expect(result.annotations[1].title).to.equal(title2);
		});
	});

	describe('_getLineNumber', () => {
		it('Can get line number', () => {
			const filePath = 'test/somewhere/here.test.js';
			const line = 666;

			const result = Mocha._getLineNumber(`this is the stack with the error location: ${filePath}:${line}:42`
				, filePath);

			expect(result).to.equal(line);
		});

		it('Can get line number when no column', () => {
			const filePath = 'test/somewhere/here.test.js';
			const line = 666;

			const result = Mocha._getLineNumber(`this is the stack with the error location: ${filePath}:${line}`
				, filePath);

			expect(result).to.equal(line);
		});

		it('Defaults to line 1 if no line number', () => {
			const filePath = 'test/somewhere/here.test.js';

			const result = Mocha._getLineNumber(`this is the stack with the error location: ${filePath}`
				, filePath);

			expect(result).to.equal(1);
		});
	});
});
