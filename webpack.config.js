const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/app/index.tsx",
  mode: "development",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "build")
  },
  devtool: "eval-cheap-module-source-map",
  externals: {
    codemirror: "CodeMirror"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          onlyCompileBundledFiles: true
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx"]
  },
  plugins: [new CopyPlugin([{ from: "public" }])]
};
