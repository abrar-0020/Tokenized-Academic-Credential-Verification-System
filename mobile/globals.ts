// WalletConnect/Reown compatibility polyfills - must be imported before anything else
import 'react-native-url-polyfill/auto';
import '@walletconnect/react-native-compat';
import 'react-native-get-random-values';
import 'fast-text-encoding';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

// Clear stale/corrupted WalletConnect sessions on startup to prevent
// "setDefaultChain of undefined" and "null keychain" crashes
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getAllKeys().then(keys => {
  const wcKeys = keys.filter(k =>
    k.startsWith('wc@2') ||
    k.startsWith('@walletconnect') ||
    k.includes('wc_') ||
    k.includes('session') ||
    k === 'WALLETCONNECT_DEEPLINK_CHOICE'
  );
  if (wcKeys.length > 0) {
    AsyncStorage.multiRemove(wcKeys).catch(() => {});
  }
}).catch(() => {});
