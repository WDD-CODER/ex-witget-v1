const { defineConfig } = require('@vue/cli-service');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isProd = process.env.NODE_ENV === 'production';

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    extract: isProd ? { filename: 'afikasafe-widget.css' } : false
  },
  configureWebpack: (config) => {
    if (isProd) {
      // This deletes the internal 'externals' property that the CLI injects
      delete config.externals;
    }

    return {
      resolve: {
        alias: {
          'vue$': 'vue/dist/vue.esm.js'
        }
      },
      output: {
        filename: isProd ? 'afikasafe-widget.js' : 'js/[name].js',
        libraryTarget: 'umd',
        libraryExport: 'default',
        globalObject: 'this'
      }
    };
  },
  chainWebpack: config => {
    config.optimization.delete('splitChunks');

    // Remove externals entirely for the library build to force bundling
    if (isProd) {
      // Explicitly set externals to an empty array to override Vue CLI's defaults
      config.externals([]);
    }

    config.module.rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.shadowMode = true;
        return options;
      });

    if (isProd) {
      config.plugin('custom-css-extract')
        .use(MiniCssExtractPlugin, [{ filename: 'afikasafe-widget.css' }]);
    }
  }
});