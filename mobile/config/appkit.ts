import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppKit } from '@reown/appkit-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';

const storage = {
  getItem: async (key: string) => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val === null || val === 'null' || val === undefined) return undefined;
      try { return JSON.parse(val); } catch { return val; }
    } catch { return undefined; }
  },
  setItem: async (key: string, value: any) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  removeItem: async (key: string) => {
    try { await AsyncStorage.removeItem(key); } catch {}
  },
  getKeys: async (): Promise<string[]> => {
    try { return [...(await AsyncStorage.getAllKeys())]; } catch { return []; }
  },
  getEntries: async (): Promise<[string, any][]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs
        .map(([k, v]) => {
          if (v === null || v === 'null') return [k, undefined] as [string, any];
          try {
            return [k, JSON.parse(v)] as [string, any];
          } catch {
            return [k, v] as [string, any];
          }
        })
        .filter(([, v]) => v !== undefined);
    } catch {
      return [];
    }
  },
};

const PROJECT_ID = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || '08005cbbce870098a0727ec7bfad4adf';

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
  } as any,
});

export { PROJECT_ID };
