const path = require('path');
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const defaultConfiguration = {
  entry: {
    'vsn': './src/vsn.ts',
    'demo': './src/demo.ts',
  },
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
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimizer: [new TerserPlugin({
    terserOptions: {
      format: {
        preamble: `/* Copyright ${new Date().getUTCFullYear()}, VSNjs. ${require('./package.json').name} ${require('./package.json').version} (${new Date().toUTCString()}) */if (window) window['VSN_VERSION']='${require('./package.json').version}';`
      }
    }
  })],
  }
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
