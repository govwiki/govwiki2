var gulp = require('gulp');
var path = require('./config.js').path;

gulp.task('watch', function() {
    gulp.watch(
        [path.base + '/js/**/*'],
        ['lint', 'build:js']
    );
});
