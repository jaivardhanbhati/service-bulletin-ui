'use strict';

var gulp = require('gulp');

gulp.task('serve', ['sass', 'server:watch', 'sass:watch']);
