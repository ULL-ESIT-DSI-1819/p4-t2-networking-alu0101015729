var gulp = require("gulp");
var shell = require("gulp-shell");

gulp.task('default', function () {
  console.log('gulp!');
});

gulp.task("pre-install", shell.task([
  "sudo npm i -g gulp static-server",
  "sudo npm install -g nodemon",
  "sudo npm install -g gulp-shell"
]));

gulp.task("server", shell.task("node net-watcher.js target.txt"));
gulp.task("client", shell.task("​​node net-watcher-ldj-client.js​"));
gulp.task("documentation", shell.task("jsdoc lib/ldj-client.js -d=Doc"));
gulp.task("test", shell.task("npm test"));
gulp.task("nc", shell.task("nc​​ ​​localhost​​ ​​60300"));
gulp.task("nc8", shell.task("nc​​ ​​localhost​​ ​​8000"));

