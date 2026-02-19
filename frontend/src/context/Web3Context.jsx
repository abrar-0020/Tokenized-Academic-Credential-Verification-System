import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_ID } from '../config/contract';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isIssuer, setIsIssuer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed (with mobile support)
  const isMetaMaskInstalled = () => {
    const { ethereum } = window;
    return Boolean(ethereum && (ethereum.isMetaMask || ethereum.providers?.some((p) => p.isMetaMask)));
  };

  // Get the correct ethereum provider (mobile fix)
  const getProvider = () => {
    const { ethereum } = window;
    
    // If ethereum exists
    if (ethereum) {
      // Check if it's directly MetaMask
      if (ethereum.isMetaMask) {
        return ethereum;
      }
      
      // Check if it's in providers array (multiple wallets)
      if (ethereum.providers) {
        const metamaskProvider = ethereum.providers.find((p) => p.isMetaMask);
        if (metamaskProvider) {
          return metamaskProvider;
        }
      }
      
      // Return ethereum anyway (might be MetaMask mobile)
      return ethereum;
    }
    
    return null;
  };

  // Connect wallet
  const connectWallet = useCallback(async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // On mobile, provider might not be available until after deep link
    if (isMobile && !isMetaMaskInstalled()) {
      try {
        setLoading(true);
        setError(null);
        
        // Try to open MetaMask via deep link
        const dappUrl = window.location.href.replace(/https?:\/\//, '');
        const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
        
        // Open MetaMask
        window.location.href = metamaskAppDeepLink;
        return;
      } catch (err) {
        setError('Please install MetaMask app and try again');
        setLoading(false);
        return;
      }
    }
    
    if (!isMetaMaskInstalled()) {
      setError('Please install MetaMask browser extension to use this application');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const provider = getProvider();
      if (!provider) {
        throw new Error('MetaMask provider not found');
      }

      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Get provider and signer
      const web3Provider = new ethers.BrowserProvider(provider);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      // Check network - if wrong, try to switch automatically
      if (Number(network.chainId) !== NETWORK_ID) {
        try {
          // Try to switch to Sepolia
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${NETWORK_ID.toString(16)}` }],
          });
          
          // Reload after switch
          window.location.reload();
          return;
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${NETWORK_ID.toString(16)}`,
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://rpc.sepolia.org'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  },
                ],
              });
              
              // Reload after adding network
              window.location.reload();
              return;
            } catch (addError) {
              setError('Please manually add Sepolia network in MetaMask app: Settings → Networks → Add Network → Sepolia');
              setLoading(false);
              return;
            }
          }
          setError(`Please switch to Sepolia network in MetaMask app. Current network is incorrect.`);
          setLoading(false);
          return;
        }
      }

      // Initialize contract
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        web3Signer
      );

      // Check roles
      const issuerRole = await contractInstance.ISSUER_ROLE();
      const adminRole = await contractInstance.DEFAULT_ADMIN_ROLE();
      const hasIssuerRole = await contractInstance.hasRole(issuerRole, accounts[0]);
      const hasAdminRole = await contractInstance.hasRole(adminRole, accounts[0]);

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setNetworkId(Number(network.chainId));
      setIsIssuer(hasIssuerRole);
      setIsAdmin(hasAdminRole);
      setLoading(false);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsIssuer(false);
    setIsAdmin(false);
    setNetworkId(null);
  }, []);

  // Check for existing connection on mount (only once)
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const provider = getProvider();
        if (!provider) return;

        // Check if already connected
        const accounts = await provider.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          // Auto-connect if previously connected
          await connectWallet();
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    // Wait a bit for mobile MetaMask to inject provider
    const timer = setTimeout(checkConnection, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const provider = getProvider();
    if (!provider) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        await connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]); // Only re-run when account changes

  const value = {
    account,
    provider,
    signer,
    contract,
    isIssuer,
    isAdmin,
    networkId,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
