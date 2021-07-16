'use strict';

const core = require('@actions/core');
const github = require('@actions/github');

class Checks {
	static async writeAnnotations(annotations) {
		console.log(github.context);
		const [owner, repo] = github.context.payload.repository.full_name.split('/');
		const sha = github.context.payload.after;
		const token = core.getInput('token');
		const octokit = github.getOctokit(token);

		await octokit.rest.checks.create({
			owner,
			repo,
			name: 'Unit Test Failures',
			head_sha: sha,
			conclusion: 'failure',
			output: annotations
		});
	}
}

module.exports = {
	Checks
};
