const path = require("path")
const fs = require("fs");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const TerserPlugin = require('terser-webpack-plugin');

// src/pages 目录为页面入口的根目录
const pagesRoot = path.resolve(__dirname, "./src/pages");
// fs 读取 pages 下的所有文件夹来作为入口，使用 entries 对象记录下来
const entries = fs.readdirSync(pagesRoot).reduce((entries, page) => {
  // 文件夹名称作为入口名称，值为对应的路径，可以省略 `index.js`，webpack 默认会寻找目录下的 index.js 文件
  entries[page] = path.resolve(pagesRoot, page);
  return entries
}, {});

module.exports = (env,argv) => ({
  // 指定构建模式
  mode: env.production ? 'production' : 'development', // 从 env 参数获取 mode
  entry: entries, // 将 entries 对象作为入口配置
  // entry: {
  //   main: './src/index.js' // main 为 entry 的名称
  // },
  output: {
    filename: 'static/js/[name].[contenthash:8].js', // 使用 [name] 来引用 entry 名称，在这里即为 main
    path: path.join(__dirname, '/dist'),
    // 路径中使用 hash，每次构建时会有一个不同 hash 值，可以用于避免发布新版本时浏览器缓存导致代码没有更新
    // 文件名中也可以使用 hash
  },
  devServer: {
    static: path.resolve(__dirname, "dist"), // 开发服务器启动路径
    // HMR
    hot: true
  },
  devtool: env.production ? false : 'eval-cheap-source-map', // 开发环境需要 source map
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      test: /\.js(\?.*)?$/i, // 只处理 .js 文件
    })], // 配置代码压缩工具
    usedExports: true, // 模块内未使用的部分不进行导出
    // webpack 会把可以优化的模块整合到一起，来减少上述那样的闭包函数的代码
    // (function(module, __webpack_exports__, __webpack_require__) { ... }
    concatenateModules: true,
    splitChunks: {
      chunks: "all", // 所有的 chunks 代码公共的部分分离出来成为一个单独的文件
      name: 'common', // 给分离出来的 chunk 起个名字
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css"
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html", // 配置文件模板
      minify: { // 压缩 HTML 的配置
        minifyCSS: true, // 压缩 HTML 中出现的 CSS 代码
        minifyJS: true, // 压缩 HTML 中出现的 JS 代码
        collapseInlineTagWhitespace: true, 
        collapseWhitespace: true, // 和上一个配置配合，移除无用的空格和换行
      }
    }),
    new webpack.DefinePlugin({
      //定义环境变量
    }),
    // 这个插件用于忽略某些特定的模块，让 webpack 不把这些指定的模块打包进去。例如我们使用 moment.js，直接引用后，里边有大量的 i18n 的代码，导致最后打包出来的文件比较大，而实际场景并不需要这些 i18n 的代码，这时我们可以使用 IgnorePlugin 来忽略掉这些代码文件，配置如下：
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  module: {
    rules: [
      {
        test: /\.css$/, 
        use: [MiniCssExtractPlugin.loader,"css-loader", {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: [postcssPresetEnv({
                autoprefixer: { grid: true }
              })],
            }
          }
        }]
      },
      {
        test: /\.scss$/, 
        use: [MiniCssExtractPlugin.loader,"css-loader", {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: [postcssPresetEnv({
                autoprefixer: { grid: true }
              })],
            }
          }
        }, "sass-loader"],
      },
      {
        test: /\.(png|jpg|gif)$/, 
        // 以下内容注释掉依然可以加载 源于 webpack5 的 asset module(资源模块)
        use: [{
          loader: "url-loader",
          options: {
            limit: 8192, // 单位是 Byte，当文件小于 8KB 时作为 DataURL 处理
            name: "static/media/[name].[hash:8].[ext]",
            esModule: false,
          },
        }],
        type: "javascript/auto" // webpack 3 默认的类型，支持现有的各种 JS 代码模块类型 —— CommonJS、AMD、ESM
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
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'), // 指定当前目录下的 node_modules 优先查找
      'node_modules', // 如果有一些类库是放在一些奇怪的地方的，你可以添加自定义的路径或者目录
    ],
    alias: {
      "@": "src",
      "@components": "src/components",   
    },
    extensions: [
      '.mjs',
      '.js',
      '.ts',
      '.tsx',
      '.json',
      '.jsx',
    ],
  }
})