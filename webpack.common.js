const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	entry: {
		app: './src/index.js',
		vendor: [
			'gl-matrix',
			'gl-buffer',
			'gl-shader',
			'gl2-now',
			'gl-texture2d',
			'glslify'
		],
 	},
	output: {
		filename: '[name].[chunkhash].js',
		chunkFilename: '[name].[chunkhash].js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env', 'stage-0'],
						plugins: ['transform-runtime'],
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
				],
			},
			{
				test: /\.(jpg|png|gif|svg)$/,
				use: [
					'file-loader',
				],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					'file-loader',
				],
			},
			{
				test: /\.(glsl|vs|fs)$/,
				use: [
					'raw-loader',
					'glslify-loader',
				],
        // loader: 'shader-loader',
      },
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'test',
		}),
		new webpack.HashedModuleIdsPlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime',
		}),
		new CleanWebpackPlugin(['dist']),
	],
};