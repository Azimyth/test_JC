'use strict';/** base */const plugins = require('gulp-load-plugins')();const gulp = require('gulp');const PathConfig = require('./gulp-settings.js');const browserSync = require('browser-sync').create();const pngquant = require('imagemin-pngquant');const gcmq = require('gulp-group-css-media-queries');const path = require('path');//const count = require('gulp-count');const del = require('del');const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';// clean images filesconst tearDown = () => del(path.resolve(__dirname, PathConfig.imgDir));const errorHandler = function (error) {	this.emit('end');}//copy images filegulp.task('copyImages', () => (	gulp		.src(path.resolve(__dirname, PathConfig.imgSourceDir + '**/**'), {			base: path.resolve(__dirname, PathConfig.imgSourceDir)		})		.pipe(plugins.cached('src'))		.pipe(gulp.dest(path.resolve(__dirname, PathConfig.imgDir)))));// watchgulp.task('watch', () => {	gulp.watch(		path.resolve(__dirname, PathConfig.sassDir + '/**/*.scss'), 		gulp.series('styles')	).on('error', errorHandler);	gulp.watch(		path.resolve(__dirname, PathConfig.imgSourceDir + '**/**'),		gulp.series('copyImages')	).on('error', errorHandler);	});//browser syncgulp.task('serve', () => {	browserSync.init({		//files: ['*.html', '*.css'],		server: {			baseDir: path.resolve(__dirname),			port: 8080,			// open: true,			directory: true,			notify: false		}	});	gulp.watch('*.html').on('change', browserSync.reload);});gulp.task('styles', () =>	gulp		.src(path.resolve(__dirname, PathConfig.sassDir + '/**/*.scss'), {			base: path.resolve(__dirname, PathConfig.sassDir)		})		.pipe(plugins.cached('src'))		.pipe(plugins.sassMultiInheritance({dir: PathConfig.sassDir + '/'}))		.pipe(plugins.if(isDevelopment, plugins.sourcemaps.init()))		.pipe(plugins.sass())		.pipe(plugins.plumber({			errorHandler: plugins.notify.onError(err => ({				title: 'Styles',				message: err.message			}))		}))		.pipe(plugins.if(isDevelopment, plugins.sourcemaps.write()))		//.pipe(count('## files', {logFiles: true}))		.pipe(gulp.dest(function(file) {			return file.stem === PathConfig.cssMainFileName ?				path.resolve(__dirname, PathConfig.cssDir) :				path.resolve(__dirname, './css/');		}))		.pipe(browserSync.stream())		//.pipe(count('## files', {logFiles: true})));// build styles and static filegulp.task('build', gulp.series(	tearDown,	gulp.parallel('styles', 'copyImages')));//css beautifulgulp.task('cssbeauty', () =>	gulp		.src(path.resolve(__dirname, PathConfig.cssDir + '/' + PathConfig.cssMainFileName +'.css'), {			base: path.resolve(__dirname, PathConfig.cssDir)		})		.pipe(plugins.autoprefixer())		.pipe(gcmq())		.pipe(plugins.csscomb())		.pipe(gulp.dest(path.resolve(__dirname, PathConfig.cssDir))));//images mingulp.task('imagesmin', () =>	gulp		.src(path.resolve(__dirname, PathConfig.imgDir + '**/*.*'), {			base: path.resolve(__dirname, PathConfig.imgDir)		})		.pipe(plugins.imagemin({			progressive: true,			optimizationLevel: 5,			use: [pngquant()]		}))		.pipe(gulp.dest(path.resolve(__dirname, PathConfig.imgDir))));/** tasks */gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));gulp.task('dist', gulp.series('build', gulp.parallel('cssbeauty', 'imagesmin')));