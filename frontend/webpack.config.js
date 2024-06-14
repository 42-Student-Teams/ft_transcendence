import dotenv from 'dotenv';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, `.env`);
const env = dotenv.config({ path: envPath }).parsed;

const envKeys = env ? Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {}) : {};



export default {
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
    new HtmlWebpackPlugin({template: './index.html',}),
    new webpack.DefinePlugin(envKeys),
    new FaviconsWebpackPlugin("./src/assets/image/header-logo.png"),
  ],
  devServer: {
    compress: true,
    port: 8080,
    hot: true,
    static: {
      directory: path.resolve('dist'),
    },
    historyApiFallback: true,
  },
};
