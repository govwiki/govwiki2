var gulp = require('gulp');
var requireDir = require('require-dir');
var runSequence = require('run-sequence');

requireDir('./gulp');

gulp.task('default', function(callback) {
    gulp.start('check-install');
    runSequence('build:js', 'watch', callback);
});
