// This should not be a transformer, but Jest allows full module path matching only for transformers, not module stubs
// https://github.com/facebook/jest/issues/7271
module.exports = {
  process() {
    return '';
  },
};
