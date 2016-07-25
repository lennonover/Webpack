/**
 * [gulp description]
 * @type {[type]}
 */
var gulp = require("gulp");
var gutil = require("gulp-util");
var del = require("del");
var rename = require('gulp-rename');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
/**
 * 定义 webpack 任务
 * 
 */
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");

var connect = require('gulp-connect');
var rest = require('connect-rest');
var mocks = require('./mocks');

/**
 * ----------------------------------------------------
 * source configuration
 * ----------------------------------------------------
 */

var src = {
  html: "src/html/*.html",                          // html 文件
  vendor: ["vendor/**/*", "bower_components/**/*"], // vendor 目录和 bower_components
  style: "src/style/*/index.less",                  // style 目录下所有 xx/index.less
  assets: "assets/**/*"                             // 图片等应用资源
};

var dist = {
  root: "dist/",
  html: "dist/",
  style: "dist/style",
  vendor: "dist/vendor",
  assets: "dist/assets"
};

var bin = {
  root: "bin/",
  html: "bin/",
  style: "bin/style",
  vendor: "bin/vendor",
  assets: "bin/assets"
};

/**
 * ----------------------------------------------------
 *  tasks
 * ----------------------------------------------------
 */

/**
 * 清理和拷贝任务
 * 在每次启动 build 的时候，
 * 需要先清除之间的 build 结果，然后将最新的文件如 html, assets, vendor 
 * 这些文件拷贝到 dist 目录中
 * var del = require("del")模块
 */
function clean(done) {
  del.sync(dist.root);
  done();
}

/**
 * [cleanBin description]
 * @return {[type]} [description]
 */
function cleanBin(done) {
  del.sync(bin.root);
  done();
}

/**
 * [copyVendor description]
 * @return {[type]} [description]
 */
function copyVendor() {
  return gulp.src(src.vendor)
    .pipe(gulp.dest(dist.vendor));
}

/**
 * [copyAssets description]
 * @return {[type]} [description]
 */
function copyAssets() {
  return gulp.src(src.assets)
    .pipe(gulp.dest(dist.assets));
}

/**
 * [copyDist description]
 * @return {[type]} [description]
 */
function copyDist() {
  return gulp.src(dist.root + '**/*')
    .pipe(gulp.dest(bin.root));
}

/**
 * [html description]
 * @return {[type]} [description]
 */
function html() {
    return gulp.src(src.html)
      .pipe(gulp.dest(dist.html))
}

/**
 * 样式转换
 * 样式使用了 gulp-less 插件，
 * 其中需要注意的一点是，less 文件如果出错可能会将整个 build 进程结束，
 * 需要添加 error 时候的处理函数，
 * 同时也能自定义的输出 error 相关的信息，样式的转换使用了 autoprefixer 代码补全
 * [style description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
function style() {
    return gulp.src(src.style)
      .pipe(cached('style'))
      .pipe(less())
      .on('error', handleError)
      .pipe(autoprefixer({
        browsers: ['last 3 version']
      }))
      .pipe(gulp.dest(dist.style))
}

exports.style = style;

/**
 * [webpackProduction description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
function webpackProduction(done) {
  var config = Object.create(webpackConfig);
  config.plugins = config.plugins.concat(
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": "production"
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );

  webpack(config, function(err, stats) {
    if(err) throw new gutil.PluginError("webpack:build", err);
    gutil.log("[webpack:production]", stats.toString({
      colors: true
    }));
    done();
  });
}


/**
 * [webpackDevelopment description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
var devConfig, devCompiler;

devConfig = Object.create(webpackConfig);
devConfig.devtool = "sourcemap";
devConfig.debug = true;
devCompiler = webpack(devConfig);

function webpackDevelopment(done) {
  devCompiler.run(function(err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack:build-dev", err);
      return;
    }
    gutil.log("[webpack:build-dev]", stats.toString({
      colors: true
    }));
    done();
  });
}
/**
 * 自动刷新和数据 mock
 * 代码的自动刷新用到了 gulp-connect 插件，并通过 connect-rest 模块实现 rest 接口的数据 mock。
 * [connectServer description]
 * @return {[type]} [description]
 */
function connectServer(done) {
  connect.server({
      root: dist.root,
      port: 8080,
      livereload: true,
      middleware: function(connect, opt) {
        return [rest.rester({
          context: "/"
        })]
      }
  });
  mocks(rest);
  done();
}

/**
 *  代码监控
 *  为了能够监控文件改变能实现自动刷新，还需要通过定义 watch 任务，监控文件的改变。
 *  这里使用到了一个 trick，只监控 dist 目录的文件，
 *  如果该目录文件改变了，使用 pipe 的方式调用 connect.reload(), 直接调用不会自动刷新
 * [watch description]
 * @return {[type]} [description]
 */
function watch() {
  gulp.watch(src.html, html);
  gulp.watch("src/**/*.js", webpackDevelopment);
  gulp.watch("src/**/*.less", style);
  gulp.watch("dist/**/*").on('change', function(file) {
    gulp.src('dist/')
      .pipe(connect.reload());
  });
}

/**
 * 任务编排
 * 最后将之前定义的任务通过 parallel 和 series 方法进行编排， 
 * 默认任务为开发任务，build 任务为 production 任务
 * default task
 */
gulp.task("default", gulp.series(
  clean, 
  gulp.parallel(copyAssets, copyVendor, html, style, webpackDevelopment), 
  connectServer, 
  watch
));

/** 
 * production build task
 */
gulp.task("build", gulp.series(
  clean, 
  gulp.parallel(copyAssets, copyVendor, html, style, webpackProduction), 
  cleanBin, 
  copyDist, 
  function(done) {
    console.log('build success');
    done();
  }
));

/**
 * 样式转换
 * [handleError description]
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
function handleError(err) {
  if (err.message) {
    console.log(err.message)
  } else {
    console.log(err)
  }
  this.emit('end')
}

/**
 * [reload description]
 * @return {[type]} [description]
 */
function reload() {
  connect.reload();
}