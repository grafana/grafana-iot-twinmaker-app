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

  // Short term solution to load hdr from aws-iot-twinmaker-grafana-utils. Update the file names if changed.
  defaultConfig.module.rules.push({
    test: /\.js$/,
    loader: 'string-replace-loader',
    options: {
      multiple: [
        {
          search: '66a6b813a5e526ab.hdr',
          replace: '/public/plugins/grafana-iot-twinmaker-app/static/66a6b813a5e526ab.hdr',
        },
        {
          search: 'd72428966460c72e.hdr',
          replace: '/public/plugins/grafana-iot-twinmaker-app/static/d72428966460c72e.hdr',
        },
        {
          search: 'f90a5be07cd617fe.hdr',
          replace: '/public/plugins/grafana-iot-twinmaker-app/static/f90a5be07cd617fe.hdr',
        },
      ]
    }
  });

  return defaultConfig;
}
module.exports = { getWebpackConfig }
