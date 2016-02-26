var gulp = require('gulp')
var livereload = require('gulp-livereload')
var gutil = require('gulp-util')

var webpack = require('webpack')

var webpackConfig = {
	entry: {
		main: './frontend/main.jsx',
		timecounter: './frontend/timecounter.jsx'
	},
	output: {
		filename: 'public/build/[name].js',
		sourceMapFilename: '[file].map'
	},
	devtool: ['source-map'],
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query:{
					"presets": ["react"]
				}
			}
		]
	}
}


gulp.task('webpack', function (callback) {
	webpack(webpackConfig, function (err, stats) {
		if (err) { throw new gutil.PluginError('webpack', err) }
		var statsAsString = stats.toString({})

		gutil.log('[webpack]', statsAsString.split('chunk')[0])
		livereload.changed('public/js/main.js')
		callback()
	})
})

gulp.task('watch', function () {
	livereload.listen()
	gulp.watch([
		'frontend/*.jsx'
	], ['webpack'])
})