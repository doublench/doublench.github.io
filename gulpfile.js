var gulp = require('gulp'),
    server = require('gulp-server-livereload'),
    livereload = require('gulp-livereload');

gulp.task('webserver', function() {
    gulp.src('./')
        .pipe(server({
            livereload: true,
            directoryListing: true,
            open: true
        }));
});
