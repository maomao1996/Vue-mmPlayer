const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

const isEnvProduction = process.env.NODE_ENV === 'production'

module.exports = {
  publicPath: '',
  chainWebpack (config) {
    config.resolve.alias
      .set('api', resolve('src/api'))
      .set('assets', resolve('src/assets'))
      .set('base', resolve('src/base'))
      .set('components', resolve('src/components'))
      .set('pages', resolve('src/pages'))
    config.plugin('html').tap(args => {
      if (isEnvProduction) {
        args[0].minify.minifyJS = true
        args[0].minify.minifyCSS = true
      }
      args[0].NODE_ENV = process.env.NODE_ENV
      return args
    })
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [resolve('src/assets/css/var.less')]
    }
  }
}
