const CopyWebpackPlugin = require('copy-webpack-plugin');

const getWebpackConfig = (defaultConfig, options) => {
  if (!defaultConfig.module) {
    defaultConfig.module = { rules: [] };
  }

  defaultConfig.module.rules.push({
    test: /\.hdr$/,
    loader: 'file-loader',
    options: {
      name: '[path][name].[ext]',
    },
  });

  return defaultConfig;
}
module.exports = { getWebpackConfig }