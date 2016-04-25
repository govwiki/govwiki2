var gulp = require('gulp');
var eslint = require('gulp-eslint');
var gulpIf = require('gulp-if');

var path = require('./config.js').path;
var argv = require('yargs').argv;

var isWatch = !!argv.watch;

var eslintOptions = {
    fix: true, // Try resolve errors automatically
};

gulp.task('lint', function() {

    if (isWatch) {
        return gulp.watch(path.base + '/js/**/*.js', lint);
    } else {
        return lint();
    }
});


gulp.task('watch', function() {

    gulp.watch(
        [path.base + '/js/**/*'],
        ['lint']
    );
});

function lint() {
    gulp.start('check-install');

    return gulp.src([
            path.base + '/js/**/*.js',
            '!src/GovWiki/FrontendBundle/Resources/public/js/vendor/**',
            '!src/GovWiki/MobileBundle/Resources/public/js/vendor/**',
            '!node_modules/**'
        ])
        .pipe(eslint(eslintOptions))
        .pipe(eslint.format())
        .pipe(gulpIf(!isWatch, eslint.failAfterError()))
        .pipe(gulpIf(isFixed, gulp.dest('src/GovWiki/FrontendBundle/Resources/public/js')));
}

function isFixed(file) {
    // Has ESLint fixed the file contents?
    return file.eslint != null && file.eslint.fixed;
}
