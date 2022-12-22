const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const dayjs = require('dayjs')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const isEnvProduction = process.env.NODE_ENV === 'production'

// 注入版本信息
process.env.VUE_APP_VERSION = require('./package.json').version
// 注入版本更新时间
process.env.VUE_APP_UPDATE_TIME = dayjs().locale('zh-cn').format('YYYY-MM-DD')

module.exports = defineConfig({
  publicPath: '',
  chainWebpack(config) {
    config.resolve.alias
      .set('api', resolve('src/api'))
      .set('assets', resolve('src/assets'))
      .set('base', resolve('src/base'))
      .set('components', resolve('src/components'))
      .set('pages', resolve('src/pages'))
    config.plugin('html').tap((args) => {
      if (isEnvProduction) {
        if (!args[0].minify) {
          /* 参考 https://github.com/jantimon/html-webpack-plugin#minification */
          args[0].minify = {
            collapseWhitespace: true,
            keepClosingSlash: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            trimCustomFragments: true
          }
        }
        args[0].minify.minifyJS = true
        args[0].minify.minifyCSS = true
      }
      return args
    })
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        resolve('src/styles/var.less'),
        resolve('src/styles/mixin.less')
      ]
    }
  },
  devServer: {
    port: 3002,
    open: false,
    proxy: {
      '/webapi': {
        ws: false,
        target: 'http://nas.uyoqu.com:5000',
        changeOrigin: true // 是否改变域名
      }
    }
    // 下边这个， 如果你是本地自己mock 的话用after这个属性，线上环境一定要干掉
    // after: require("./mock/mock-server.js")
  }
})
