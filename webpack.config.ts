import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import grafanaConfig from './.config/webpack/webpack.config';

const config = async (env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    module: {
      rules: [
        {
          test: /\.hdr$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'static',
            publicPath: 'public/plugins/grafana-iot-twinmaker-app/static/',
          },
        },
      ],
    },
    resolve: {
      fallback: {
        util: false,
        crypto: false,
        path: require.resolve('path-browserify'),
      },
    },
    plugins: [
      new WebpackShellPluginNext({
      onBuildEnd:{
        scripts: ['npx matterport-assets dist/static/matterport'],
        blocking: false,
        parallel: true
      }})
    ],
  });
};

export default config;
