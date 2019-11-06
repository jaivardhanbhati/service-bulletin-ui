'use strict';

// include require-dir for loading tasks
var requireDir = require('require-dir');

// Load tasks from tasks folder
requireDir('./gulp-tasks/', { recurse: true });
