const path = require('path');

module.exports = {
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
  output: {
    filename: 'vision.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};