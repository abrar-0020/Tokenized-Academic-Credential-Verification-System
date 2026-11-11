# TokCred Production Deployment Guide (Vercel + Ethereum Sepolia)

## 1. Vercel Project Settings
- **Framework Preset**: Configured via [`vercel.json`](./vercel.json)
- **Build Output**: `dist` (copied from `frontend/dist`)
- **Serverless APIs**:
  - `/api/credential-crypto` ([`api/credential-crypto.js`](./api/credential-crypto.js))
  - `/api/pinata` ([`api/pinata.js`](./api/pinata.js))

## 2. Required Vercel Environment Variables (`Production` & `Preview`)

### Server-Only Secrets (Set Type = **Secret**)
- `IPFS_API_KEY`: Your Pinata API key
- `IPFS_SECRET_KEY`: Your Pinata API secret
- `CREDENTIAL_MASTER_KEY`: Persistent 256-bit random secret for AES-256-GCM key derivation (never change once credentials are issued)

### Public / Network Config (Set Type = **Config**)
- `CONTRACT_ADDRESS`: Deployed Sepolia `AcademicCredential` address (e.g. `0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1`)
- `SEPOLIA_RPC_URL`: Ethereum Sepolia JSON-RPC URL (`https://ethereum-sepolia-rpc.publicnode.com` or Alchemy/Infura RPC)
- `VITE_CONTRACT_ADDRESS`: Same deployed Sepolia contract address
- `VITE_NETWORK_ID`: `11155111`
- `VITE_NETWORK_NAME`: `sepolia`
- `VITE_IPFS_GATEWAY`: `https://gateway.pinata.cloud/ipfs/`
- `VITE_PUBLIC_RPC_URL`: Public read-only RPC (`https://ethereum-sepolia-rpc.publicnode.com`)

> **Important:** Never prefix Pinata keys or `CREDENTIAL_MASTER_KEY` with `VITE_`, as Vite bundles all `VITE_*` variables into public browser JavaScript.

## 3. Pre-Deploy Checks
```bash
npm test
cd frontend && npm run build
```
