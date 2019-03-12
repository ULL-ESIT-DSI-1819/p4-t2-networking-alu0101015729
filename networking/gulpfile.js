var gulp = require("gulp");
var shell = require("gulp-shell");


gulp.task('serve',shell.task("node test-json-service.js target.txt"));
gulp.task('watch',shell.task("watch -n 5 touch target.txt"));
gulp.task('nc',shell.task("nc localhost 60300"));
gulp.task('net',shell.task("node net-watcher.js target.txt"));
gulp.task('documentation',shell.task("documentation build *.js -f md -o documentation.md"));