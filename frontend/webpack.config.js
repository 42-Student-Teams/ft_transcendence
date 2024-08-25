import dotenv from 'dotenv';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __filename =  fileURLToPath(import.meta.url);
const __dirname = path.resolve();

export default {
  entry: './src/app.js',
  mode: 'development',
  devServer: {
    webSocketServer: false,
    compress: true,
    port: 8080,
    hot: true,
    allowedHosts: "pong.ch",
    proxy: [
        /*{
          context: ['/backend'],
          //target: 'https://google.ch',
          logLevel: 'debug',
          //router: () => 'https://api.pong.ch',
          //target: 'https://api.pong.ch',
          //target: 'http://backend:8069',
          target: `${env.BACKEND_IP}:8069`,
          //target: '192.168.1.249:8069',
          changeOrigin: true,
          secure: false,
          //pathRewrite: {'^/backend': ''}
        },*/
        {
          context: ['/api'],
          target: 'https://api.intra.42.fr',
          changeOrigin: true,
          pathRewrite: {'^/api': ''}
        }
    ],
    static: path.resolve(__dirname, 'dist'),
    historyApiFallback: true,
  },
  output: {
    filename: 'bundle.js',
    clean : true,
    path: path.resolve(__dirname, 'dist'),
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
    new HtmlWebpackPlugin({ template: './index.html', }),
    new FaviconsWebpackPlugin("./src/assets/image/header-logo.png"),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed)
    })
  ],
};
