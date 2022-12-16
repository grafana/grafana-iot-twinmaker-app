const getWebpackConfig = (defaultConfig, options) => {
  if (!defaultConfig.module) {
    defaultConfig.module = { rules: [] };
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

  // For grafana server started from public build, react is built with production mode
  // Setting the plugin mode to be production as well to avoid page freeze issue caused
  // by react and react-reconciler running is different mode.
  // If you are running grafana server from github with development, change this mode
  // to match with it.
  defaultConfig.mode = 'production';

  return defaultConfig;
};
module.exports = { getWebpackConfig };
