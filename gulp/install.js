var gulp = require('gulp');
var chmod = require('gulp-chmod');
var rename = require('gulp-rename');

var fs = require('fs');

gulp.task('check-install', function() {
    if (!fs.existsSync('.git/hooks/pre-commit')) {
        return gulp.start('install');
    }
});

gulp.task('install', function() {
                                   console.log('yes2');
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