let _orsKey = '';

try {
  const Config = require('react-native-config')?.default;
  _orsKey = Config?.ORS_API_KEY || '';
} catch {
  // react-native-config native module not available
}

// Fallback if react-native-config fails to load
if (!_orsKey) {
  _orsKey =
    '';
}

export const ORS_API_KEY = _orsKey;
