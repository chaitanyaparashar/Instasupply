const dotenv = require('dotenv');
const path = require('path');

const env = dotenv.config({path: path.resolve(__dirname, '.env')}).parsed || {};

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['transform-inline-environment-variables', {
      include: Object.keys(env),
    }],
  ],
};

// Inject into process.env so the babel plugin can pick them up
Object.assign(process.env, env);
