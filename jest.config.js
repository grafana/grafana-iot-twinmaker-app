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
  '@matterport',
  '@react-three',
  '3d-tiles-renderer',
  'bail',
  'comma-separated-tokens',
  'decode-named-character-reference',
  'hast-util.*',
  'is-absolute-url',
  'is-plain-obj',
  'mdast-util.*',
  'micromark.*',
  'property-information',
  'react-markdown',
  'react-router-dom',
  'react-router',
  'rehype-sanitize',
  'remark.*',
  'rxjs',
  'space-separated-tokens',
  'three',
  'trough',
  'trim-lines',
  'unified',
  'unist-util.*',
  'vfile.*',
  '@cloudscape-design',
  '@popperjs',
  '@react-dnd',
  'd3-format',
  'd3-array',
  'dnd-core',
  'internmap',
  'react-cytoscapejs',
  'react-dnd',
  'react-dnd-html5-backend',
  'echarts',
  'zrender',
  'nanoid',
  '@iot-app-kit/react-components',
  'parse-duration',
];

module.exports = {
  resolver: `<rootDir>/tests/utils/resolver.js`,
  ...originalConfig,
  // Inform jest to only transform specific node_module packages.
  transformIgnorePatterns: [nodeModulesToTransform([...grafanaESModules, ...esModules])],
  moduleNameMapper: {
    ...originalConfig.moduleNameMapper,
    '\\.(hdr)$': '<rootDir>/tests/utils/__mocks__/styleMock.js',
    '\\.(svg)$': 'jest-transform-stub'
  },
};
