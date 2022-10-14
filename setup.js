'use strict';

var child_process = require('child_process');

child_process.execSync('npm install --omit=dev', { stdio: [0, 1, 2], cwd: __dirname });
