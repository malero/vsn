const path = require('path');
const webpack = require("webpack");

const defaultConfiguration = {
  entry: './src/Vision.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [],
  output: {
    filename: 'vision.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

function buildConfig(env) {
  defaultConfiguration.plugins.push(new webpack.DefinePlugin({
    BUILD: JSON.stringify(env.BUILD),
    IN_DEVELOPMENT: JSON.stringify(env.BUILD === 'development')
  }));
  return require("./webpack." + env.BUILD + ".js")(env, defaultConfiguration);
}
module.exports = buildConfig;
