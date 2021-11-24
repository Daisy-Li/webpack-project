const path = require("path")
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')

// src/pages 目录为页面入口的根目录
const pagesRoot = path.resolve(__dirname, "./src/pages");
// fs 读取 pages 下的所有文件夹来作为入口，使用 entries 对象记录下来
const entries = fs.readdirSync(pagesRoot).reduce((entries, page) => {
  // 文件夹名称作为入口名称，值为对应的路径，可以省略 `index.js`，webpack 默认会寻找目录下的 index.js 文件
  entries[page] = path.resolve(pagesRoot, page);
  return entries
}, {});

module.exports = {
  mode: "production", // 指定构建模式
  entry: entries, // 将 entries 对象作为入口配置
  output: {
    filename: 'static/js/[name].[contenthash:8].js', // 使用 [name] 来引用 entry 名称，在这里即为 main
    path: path.join(__dirname, '/dist'),
    // 路径中使用 hash，每次构建时会有一个不同 hash 值，可以用于避免发布新版本时浏览器缓存导致代码没有更新
    // 文件名中也可以使用 hash
  },
  devServer: {
    static: path.resolve(__dirname, "dist") // 开发服务器启动路径
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css"
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html", // 配置文件模板
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/, 
        use: [MiniCssExtractPlugin.loader,"css-loader"]
      },
      {
        test: /\.scss$/, 
        use: [MiniCssExtractPlugin.loader,"css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpg|gif)$/, 
        // 以下内容注释掉依然可以加载 源于 webpack5 的 asset module(资源模块)
        use: [{
          loader: "url-loader",
          options: {
            limit: 500,
            name: "static/media/[name].[hash:8].[ext]",
            esModule: false,
          },
        }],
        type: "javascript/auto"
      },
      {
        test: /\.jsx$/,
        include: [
          path.resolve(__dirname,"src"),
        ],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          }
        }
      }

    ]
  }
}