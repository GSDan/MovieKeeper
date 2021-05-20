module.exports = {
  root: true,
  parserOptions : {
    ecmaVersion: 2017
  },
  env: {
    es6: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "google"
    ],
  rules: {
    "linebreak-style" : "off",
    "indent" : "off",
    "max-len" : "off",
    "key-spacing" : "off",
    "quotes" : "off",
    "no-extend-native" : "off",
    "brace-style" : ["error", "allman", {"allowSingleLine": true}],
    "padded-blocks" : ["error", "never", {"allowSingleLineBlocks": true}],
    "comma-dangle": ["error", "never"]
  }
};
