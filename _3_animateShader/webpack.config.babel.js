
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';


module.exports = (env = {}) => {
  const isProduction = env.production === true;
  const devPort = 8080;

  return {
    entry: [
      path.join(__dirname, 'src', 'index.js'),
    ],
    output: {
      path: path.join(__dirname, 'build'),
      publicPath: '/',
      filename: 'main.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.join(__dirname, 'src'),
          loader: 'babel-loader',
        },
        {
          test: /\.(glsl|frag|vert)$/,
          exclude: /node_modules/,
          loader: 'raw-loader',
        },
      ],
    },
    devServer: {
      port: devPort,
    },
    devtool: (() => {
      if (isProduction) return 'hidden-source-map';
      return 'cheap-module-eval-source-map';
    })(),
    plugins: [
      new HtmlWebpackPlugin({
        title: 'WebGL Experiments',
      }),
    ],
  };
};
