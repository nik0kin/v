var compileLess = require('broccoli-less-single'),
  concatenate = require('broccoli-concat'),
  mergeTrees  = require('broccoli-merge-trees'),
  pickFiles   = require('broccoli-static-compiler'),
  uglifyJs    = require('broccoli-uglify-js'),
  esTranspiler = require('broccoli-6to5-transpiler'),
  env = require('broccoli-env').getEnv();

var app = 'app',
  appCss,
  appHtml,
  appLib,
  appJs,
  appImg;

/** 
 * move the index.html file from the project /app folder
 * into the build assets folder
 */
appHtml = pickFiles(app, {
  srcDir  : '/',
  files   : ['index.html'],
  destDir : '/'
});

/**
 * put all the bower dependencies under /lib
 */
var lodash,
  jquery,
  bootstrapCss,
  requirejs;

lodash = pickFiles('bower_components', {
  srcDir: '/lodash',
  files: ['lodash.js'],
  destDir: '/lib'
});

jquery = pickFiles('bower_components', {
  srcDir: '/jquery/dist',
  files: ['jquery.js'],
  destDir: '/lib'
});

bootstrapCss = pickFiles('bower_components', {
  srcDir: '/bootstrap/dist/css',
  files: [
    'bootstrap.css',
    'bootstrap-theme.css',
    'bootstrap.css.map',
    'bootstrap-theme.css.map'
  ],
  destDir: '/lib'
});

requirejs = pickFiles('bower_components', {
  srcDir: '/requirejs',
  files: ['require.js'],
  destDir: '/lib'
});

appLib = mergeTrees([lodash, jquery, bootstrapCss, requirejs]);

/**
 * concatenate and compress all of our JavaScript files in 
 * the project /app folder into a single app.js file in 
 * the build assets folder
 */
//appJs = concatenate(app, {
//  inputFiles : ['**/*.js'],
//  outputFile : '/assets/app.js'
//});

appJs = pickFiles(app, {
  srcDir: '/js',
  files: ['**/*.js'],
  destDir: '/js'
});

appJs = esTranspiler(appJs, {
  modules: 'amd',
  moduleRoot: 'js/' // wtf, this doesnt work
});

//if (env === 'production') {
//  appJs = uglifyJs(appJs, {
//    compress: true,
//    mangle: true
//  });
//}

//appImg = pickFiles(app, {
//  srcDir  : '/',
//  files   : ['**/*.png','**/*.jpg', '**/*.ico'],
//  destDir : '/'
//});

appCss = compileLess(app, 'styles/app.less', '/app.css');

// merge HTML, JavaScript and CSS trees into a single tree and export it
module.exports = mergeTrees([appHtml, appLib, appJs, appCss/*, appImg*/]);
