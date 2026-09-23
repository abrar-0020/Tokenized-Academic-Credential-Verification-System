import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { checkRoles } from '@/services/blockchain/credentials';

// WalletContext holds ONLY connection state.
// All blockchain/IPFS logic lives in services/.

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
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isIssuer, setIsIssuer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On React Native, wallet connection goes through Reown AppKit deep link.
  // This stub is called after AppKit returns the provider/account.
  // The actual AppKit integration wraps this context in app/_layout.tsx.
  const connectWallet = useCallback(async () => {
    // AppKit sets window.ethereum via deep link on Android/iOS.
    // This function finalises the connection once ethereum is injected.
    const ethereum = (global as any).ethereum;
    if (!ethereum) {
      setError('No wallet provider found. Please install MetaMask or use WalletConnect.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) throw new Error('No accounts returned');

      const web3Provider = new ethers.BrowserProvider(ethereum);
      const web3Signer = await web3Provider.getSigner();

      const roles = await checkRoles(web3Signer, accounts[0]);

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setIsIssuer(roles.isIssuer);
      setIsAdmin(roles.isAdmin);
    } catch (err: any) {
      setError(err.message ?? 'Connection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsIssuer(false);
    setIsAdmin(false);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{ account, provider, signer, isIssuer, isAdmin, loading, error, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}
