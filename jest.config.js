// force timezone to UTC to allow tests to work regardless of local timezone
// generally used by snapshots, but can affect specific tests
process.env.TZ = 'UTC';

// Jest configuration provided by @grafana/create-plugin
const originalConfig = require('./.config/jest.config');
const { grafanaESModules, nodeModulesToTransform } = require('./.config/jest/utils');

// jest will import the esmodules bundle of these packages which need transforming
// prior to tests running
const esModules = [
  '@awsui',
  '@babel/runtime',
  '@iot-app-kit',
  '@react-three',
  '3d-tiles-renderer',
  'is-absolute-url',
  'react-router-dom',
  'react-router',
  'rxjs',
  'three',
];

module.exports = {
  resolver: `<rootDir>/tests/utils/resolver.js`,
  ...originalConfig,
  // Inform jest to only transform specific node_module packages.
  transformIgnorePatterns: [nodeModulesToTransform([...grafanaESModules, ...esModules])],
  moduleNameMapper: { ...originalConfig.moduleNameMapper, '\\.(hdr)$': '<rootDir>/tests/utils/__mocks__/styleMock.js' },
};
