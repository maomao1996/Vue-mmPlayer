module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  extends: ['plugin:vue/recommended', 'prettier', 'plugin:prettier/recommended'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 10,
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': [
      'warn',
      {
        html: {
          void: 'always',
          normal: 'never',
        },
        svg: 'never',
        math: 'never',
      },
    ],
    'vue/multiline-html-element-content-newline': 'off',
    'vue/name-property-casing': ['error', 'PascalCase'],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-sequences': 2,
  },
}
