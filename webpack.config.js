const path = require('path');
const webpack = require("webpack");

const defaultConfiguration = {
  entry: './src/vsn.ts',
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
    filename: 'vsn.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

function buildConfig(env) {
  console.log(env);
  defaultConfiguration.plugins.push(new webpack.DefinePlugin({
    BUILD: JSON.stringify(env.BUILD),
    IN_DEVELOPMENT: JSON.stringify(env.BUILD === 'development'),
    DO_BENCHMARK: JSON.stringify([1, '1', 'True', 'true'].indexOf(env.BENCHMARK) > -1),
  }));
  return require("./webpack." + env.BUILD + ".js")(env, defaultConfiguration);
}

module.exports = buildConfig;
