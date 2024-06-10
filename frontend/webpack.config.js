import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

export default {
  watch: true,
  entry: './src/app.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve('dist'),
  },
  module: {
    rules: [
      {
				test: /\.(png|jpe?g|gif|svg)$/i,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "static/img",
						},
					},
				],
			},
      {
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new FaviconsWebpackPlugin("./src/assets/image/header-logo.png"),
  ],
  devServer: {
    compress: true,
    port: 8080,
    port: 8080,
    hot: true,
    static: {
      directory: path.resolve('dist'),
    },
    historyApiFallback: true,
  },
};
