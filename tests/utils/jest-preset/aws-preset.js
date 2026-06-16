module.exports = {
  transform: {
    'node_modules/@amzn/awsui-.+\\.js$': require.resolve('./js-transformer'),
    'node_modules/@amzn/awsui-.+\\.css': require.resolve('./css-transformer'),
  },
  transformIgnorePatterns: ['/node_modules/(?!@amzn/awsui-).+\\.js$'],
};
