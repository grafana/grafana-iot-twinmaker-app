module.exports = {
  transform: {
    'node_modules/three.+\\.js$': require.resolve('./js-transformer'),
  },
  transformIgnorePatterns: ['/node_modules/(?!three).+\\.js$'],
};
