const defaultPreset = require("cssnano-preset-default");

module.exports = defaultPreset({
  normalizeWhitespace: false,
  reduceTransforms: false,
  zindex: false,
  orderedValues: false,
  calc: false
});
