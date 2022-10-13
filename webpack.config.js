const getWebpackConfig = (defaultConfig, options) => {
  if (!defaultConfig.module) {
    defaultConfig.module = { rules: []};
  }

  // Long term solution to load hdr
  defaultConfig.module.rules.push({
    test: /\.hdr$/,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      outputPath: 'static',
      publicPath: 'public/plugins/grafana-iot-twinmaker-app/static/',
    },
  });

  return defaultConfig;
}
module.exports = { getWebpackConfig }
