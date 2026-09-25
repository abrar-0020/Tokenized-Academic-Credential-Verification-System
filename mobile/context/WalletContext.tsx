import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { checkRoles } from '@/services/blockchain/credentials';
import { useAppKitAccount, useAppKitProvider, useAppKit } from '@reown/appkit-react-native';

type WalletContextType = {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  isIssuer: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isIssuer, setIsIssuer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');

  // When AppKit connects and we get a provider, build the ethers signer
  useEffect(() => {
    async function setupProvider() {
      if (isConnected && walletProvider && address) {
        try {
          const web3Provider = new ethers.BrowserProvider(walletProvider as any);
          const web3Signer = await web3Provider.getSigner();
          const roles = await checkRoles(web3Signer, address);

          setProvider(web3Provider);
          setSigner(web3Signer);
          setIsIssuer(roles.isIssuer);
          setIsAdmin(roles.isAdmin);
          setError(null);
        } catch (err: any) {
          console.warn('Role check failed (may be on wrong network):', err.message);
          // Still set provider/signer even if role check fails
          const web3Provider = new ethers.BrowserProvider(walletProvider as any);
          const web3Signer = await web3Provider.getSigner();
          setProvider(web3Provider);
          setSigner(web3Signer);
          setError(null);
        }
      } else if (!isConnected) {
        setProvider(null);
        setSigner(null);
        setIsIssuer(false);
        setIsAdmin(false);
      }
    }

    setupProvider();
  }, [isConnected, walletProvider, address]);

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await open();
    } catch (err: any) {
      setError(err.message ?? 'Connection failed');
    } finally {
      setLoading(false);
    }
  }, [open]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setIsIssuer(false);
    setIsAdmin(false);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account: address ?? null,
        provider,
        signer,
        isIssuer,
        isAdmin,
        loading,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
