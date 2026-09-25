import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppKit } from '@reown/appkit-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';

const storage = {
  getItem: async (key) => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val === null || val === 'null' || val === undefined) return undefined;
      try { return JSON.parse(val); } catch { return val; }
    } catch { return undefined; }
  },
  setItem: async (key, value) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  removeItem: async (key) => {
    try { await AsyncStorage.removeItem(key); } catch {}
  },
  getKeys: async () => {
    try { return await AsyncStorage.getAllKeys(); } catch { return []; }
  },
  getEntries: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs.map(([k, v]) => {
        if (v === null || v === 'null') return [k, undefined];
        try { return [k, JSON.parse(v)]; } catch { return [k, v]; }
      }).filter(([, v]) => v !== undefined);
    } catch { return []; }
  },
};

const PROJECT_ID = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const metadata = {
  name: 'TokCred',
  description: 'Tokenized Academic Credential Verification',
  url: 'https://tokcred.example.com',
  icons: ['https://raw.githubusercontent.com/nicolo-ribaudo/tc39-proposal-icons/main/icons/proposal-icon.png'],
  redirect: { native: 'tokcred://' },
};

const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.EXPO_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};

const ethersAdapter = new EthersAdapter();

// createAppKit returns the singleton instance — must be passed to AppKitProvider
export const appKitInstance = createAppKit({
  projectId: PROJECT_ID,
  metadata,
  adapters: [ethersAdapter],
  networks: [sepolia],
  defaultNetwork: sepolia,
  storage,
  features: {
    email: false,
    socials: [],
  },
});

export { PROJECT_ID };
