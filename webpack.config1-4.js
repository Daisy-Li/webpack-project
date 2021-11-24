const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: "production", // 指定构建模式
  // entry: "./src/index.js", //指定构建入口
  // output: {
  //   path: path.resolve(__dirname,"dist"),  // 指定构建生成文件所在路径
  //   filename: "static/js/bundle.js", // 指定构建生成的文件名
  // },
  entry: {
    main: './src/index.js' // main 为 entry 的名称
  },
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