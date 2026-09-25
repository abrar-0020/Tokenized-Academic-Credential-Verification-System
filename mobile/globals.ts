// WalletConnect/Reown compatibility polyfills — must be imported before anything else
import 'react-native-url-polyfill/auto';
import '@walletconnect/react-native-compat';
import 'react-native-get-random-values';
import 'fast-text-encoding';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
