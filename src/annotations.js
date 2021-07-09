'use strict';

class Annotations {
	constructor({
		numErrors
	}) {
		this.title = 'Some unit test(s) have failed';
		this.summary = `${numErrors} failure(s) were found`;
		this.annotations = [];
	}
}

module.exports = {
	Annotations
};
