'use strict';

class Annotation {
	constructor({
		title,
		message,
		path,
		line
	}) {
		this.path = path;
		this.start_line = line;
		this.end_line = line;
		this.annotation_level = 'failure';
		this.message = message;
		this.title = title;
	}
}

module.exports = {
	Annotation
};
