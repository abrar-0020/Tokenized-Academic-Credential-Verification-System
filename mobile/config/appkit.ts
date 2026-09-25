import { createAppKit, defaultConfig } from '@reown/appkit-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';

// ─── WalletConnect / Reown AppKit Configuration ─────────────────────────────
// Get your projectId from https://cloud.reown.com (free)
const PROJECT_ID = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const metadata = {
  name: 'TokCred',
  description: 'Tokenized Academic Credential Verification',
  url: 'https://tokcred.example.com',
  icons: ['https://raw.githubusercontent.com/nicolo-ribaudo/tc39-proposal-icons/main/icons/proposal-icon.png'],
  redirect: {
    native: 'tokcred://',
  },
};

// Sepolia testnet definition
const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: process.env.EXPO_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
};

const ethersAdapter = new EthersAdapter();

createAppKit({
  projectId: PROJECT_ID,
  metadata,
  adapters: [ethersAdapter],
  networks: [sepolia],
  defaultNetwork: sepolia,
  features: {
    email: false,
    socials: [],
  },
});

export { PROJECT_ID };
