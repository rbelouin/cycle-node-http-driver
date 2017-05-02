const path = require('path');

const { createConfig, entryPoint, setOutput } = require('@webpack-blocks/webpack2');
const typescript = require('@webpack-blocks/typescript');

const configuration = createConfig([
  entryPoint(path.join(process.cwd(), 'src', 'index.ts')),
  setOutput({
    filename: 'index.js',
    path: path.join(process.cwd(), 'dist'),
    libraryTarget: 'commonjs2'
  }),
  typescript()
]);

module.exports = Object.assign({}, configuration, {
  target: 'node'
});
