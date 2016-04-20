var gulp = require('gulp');
var mocha = require('gulp-mocha');

var options = {
    reporter: 'list',
    ui: 'bdd'
};

gulp.task('unit', function() {
    return gulp.src('tests/frontend/unit/**/*.js', {read: false})
        .pipe(mocha(options));
});
