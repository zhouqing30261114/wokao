const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
	plugins: [
		new uglifyjsWebpackPlugin(),
	],
});