const gulp              = require('gulp'),
      del               = require('delete'),
      run               = require('gulp-run'),
      vfs               = require('vinyl-fs'),
      map               = require('map-stream');
      uglify            = require('gulp-uglify'),
      htmlMinify        = require('html-minifier-terser'),
      browserSync       = require('browser-sync').create(),
      source            = require('vinyl-source-stream');

function compile(cb) {
  return run('npm run build --prefix ./wasm/').exec();
}

function copy_js(cb) {
  return gulp.src(['./wasm/build/index.js'])
              .pipe(uglify())
              .pipe(gulp.dest('./app/js/'));
}

function copy_wasm(cb) {
  return gulp.src(['./wasm/build/index_bg.wasm'])
              .pipe(gulp.dest('./app/wasm/'));
}

const options = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  html5: true,
  minifyJS: true,
  processConditionalComments: true,
  processScripts: 'text/html',
  removeAttributeQuotes: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeTagWhitespace: true,
  sortAttributes: true,
  sortClassName: true,
  trimCustomFragments: true,
  useShortDoctype: true
};

function copy_html(cb) {
  let minify = async function(file, cb) {
    const buffer = await htmlMinify.minify(file.contents.toString(), options);
    cb(null, buffer);
  };
  return gulp.src('./res/index.html')
              .pipe(map(minify))
              .pipe(source('index.html'))
              .pipe(vfs.dest('./app/'));
}

function wasm_done(cb) {
  browserSync.reload();
  cb();
}

function server(cb) {
  browserSync.init({
    server: {
      baseDir: "./app"
    }
  });
  gulp.watch('./wasm/src/*', 
    gulp.series(clean, compile, copy_js, copy_wasm, copy_html, wasm_done));
  cb();
}

function clean(cb) {
  del(['./res/js/*','./app/*'],cb);
}



exports.server  = gulp.series(server);
exports.default = gulp.series(clean, compile, copy_js, copy_wasm, copy_html);
