module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    indent: ['warning', 4],
    'no-console': 0,
    yoda: ['error', 'never', { onlyEquality: true }],
  },
};
