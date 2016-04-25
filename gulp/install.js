var gulp = require('gulp'),
    chmod = require('gulp-chmod'),
    rename = require('gulp-rename');

gulp.task('install', function() {

    if (/^win/.test(process.platform)) {
        console.log('there');
        return gulp.src(['gulp/git-hooks/*-win', 'gulp/git-hooks/*-js'], {
                base: 'gulp/git-hooks'
            })
            .pipe(rename(function fixName(path) {
                path.basename = path.basename.replace('-win', '');
            }))
            .pipe(gulp.dest('.git/hooks'));

    } else {

        return gulp.src('gulp/git-hooks/*-js', {
                base: 'gulp/git-hooks'
            })
            .pipe(rename(function fixName(path) {
                path.basename = path.basename.replace('-js', '');
            }))
            .pipe(chmod(755))
            .pipe(gulp.dest('.git/hooks'));
    }

});