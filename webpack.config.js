// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
<<<<<<< HEAD
=======

>>>>>>> 98277ee023d30002fc76c7cce1d6b8f4e3f54944

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "source-map",
<<<<<<< HEAD
  resolve:{
    fallback:{
=======
  resolve: {
    fallback: {
>>>>>>> 98277ee023d30002fc76c7cce1d6b8f4e3f54944
      fs: false,
      path: false
    }
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
    
    new CopyWebpackPlugin({
      patterns: [
        {from: "assets"}
      ]  
    }),

    new CopyWebpackPlugin({
      patterns: [
        {from: 'assets'}
      ]
    }),
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
