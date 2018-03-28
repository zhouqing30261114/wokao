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
				test: /\.less$/,
				use: [
					'style-loader',
					'css-loader',
					'less-loader',
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
			{
				test: /\.ejs$/,
				use: [
					'ejs-loader?variable=data',
				],
      },
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/index.ejs',
		}),
		new webpack.HashedModuleIdsPlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime',
		}),
		// 使得ejs生效
		new webpack.ProvidePlugin({
			_: "underscore",
		}),
		new CleanWebpackPlugin(['dist']),
	],
};