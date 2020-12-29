module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  ignorePatterns: ['/src/functools.js', '/src/fulfill.js'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'camelcase': 'off',
    'function-paren-newline': 'off',
    'no-param-reassign': 'warn',
    'object-curly-newline': 'off',
    'object-property-newline': 'off',
    'operator-assignment': 'off',
    'no-multiple-empty-lines': ['off', {
      'max': 2
    }],
    'object-shorthand': 'off',
    'prefer-arrow-callback': 'warn',
    'prefer-destructuring': ['error', {
      'array': false,
    }],
    'indent': ['off', {
      'FunctionDeclaration': {
        'parameters': 'first'
      }
    }],
  },
};
