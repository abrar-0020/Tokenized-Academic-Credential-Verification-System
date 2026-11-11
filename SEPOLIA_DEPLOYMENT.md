# 🌐 Sepolia Testnet Deployment Guide

Complete step-by-step guide to deploy your Tokenized Academic Credential Verification System to Sepolia Ethereum testnet.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup API Keys & Accounts](#setup-api-keys--accounts)
3. [Environment Configuration](#environment-configuration)
4. [Deploy Smart Contract](#deploy-smart-contract)
5. [Configure Frontend](#configure-frontend)
6. [Verify Contract (Optional)](#verify-contract-optional)
7. [Test Deployment](#test-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### ✅ Required Before Starting:

- [x] Node.js v18+ installed
- [x] Project dependencies installed (`npm run install-all`)
- [x] Smart contracts compiled (`npm run compile`)
- [x] MetaMask wallet installed
- [x] Basic understanding of blockchain/Web3

### ⏱️ Estimated Time: 15-20 minutes

---

## 2. Setup API Keys & Accounts

### Step 2.1: Create Alchemy Account (Blockchain Node Provider)

1. **Visit:** [https://www.alchemy.com/](https://www.alchemy.com/)
2. **Sign up** for a free account
3. **Create New App:**
   - Click "Create New App"
   - Name: "Academic Credentials"
   - Chain: **Ethereum**
   - Network: **Ethereum Sepolia**
4. **Get API Key:**
   - Click on your app
   - Click "View Key"
   - Copy the **API KEY**
   - Copy the **HTTPS URL** (it will look like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`)

📝 **Save these for Step 3!**

---

### Step 2.2: Create Pinata Account (IPFS Storage)

1. **Visit:** [https://www.pinata.cloud/](https://www.pinata.cloud/)
2. **Sign up** for a free account (1 GB free storage)
3. **Generate API Keys:**
   - Go to "API Keys" section
   - Click "New Key"
   - Enable permissions:
     - ✅ pinFileToIPFS
     - ✅ pinJSONToIPFS
   - Name it: "Academic Credentials"
   - Click "Create Key"
4. **Copy Credentials:**
   - Copy **API Key**
   - Copy **API Secret**
   - ⚠️ **Important:** Save immediately! You won't see the secret again!

📝 **Save these for Step 3!**

---

### Step 2.3: Get Sepolia Test ETH (Faucet)

You need ~0.1 test ETH for deployment and transactions.

1. **Copy your MetaMask wallet address**
2. **Visit one of these faucets:**

   **Option 1: Alchemy Sepolia Faucet (Recommended)**
   - URL: [https://www.alchemy.com/faucets/ethereum-sepolia](https://www.alchemy.com/faucets/ethereum-sepolia)
   - Requires: Alchemy account
   - Amount: 0.5 SepoliaETH/day

   **Option 2: Sepolia PoW Faucet**
   - URL: [https://sepolia-faucet.pk910.de/](https://sepolia-faucet.pk910.de/)
   - No registration required
   - Mine for test ETH

   **Option 3: Infura Sepolia Faucet**
   - URL: [https://www.infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia)
   - Requires: Infura account

3. **Enter your wallet address**
4. **Wait 1-2 minutes** for ETH to arrive
5. **Verify in MetaMask** (switch to Sepolia network)

✅ **Goal:** Have at least 0.05 SepoliaETH in your wallet

---

### Step 2.4: Export MetaMask Private Key

⚠️ **CRITICAL SECURITY WARNING:**
- NEVER share your private key
- NEVER commit it to GitHub
- Use a test wallet (not your main wallet with real funds)
- Keep it secure in environment variables only

**Steps to export:**

1. Open MetaMask
2. Click the three dots menu → **Account Details**
3. Click **"Show Private Key"**
4. Enter your password
5. Click to reveal and copy the private key
6. Save it temporarily (you'll use it in Step 3)

📝 **Save this for Step 3!**

---

## 3. Environment Configuration

### Step 3.1: Configure Backend Environment

1. **Navigate to project root directory**

```bash
cd "C:\Users\abrar\Documents\Projets(new)\Tokenized Academic Credential Verification System"
```

2. **Create `.env` file from example:**

```bash
# Copy the example file
Copy-Item .env.example .env
```

3. **Edit `.env` file with your values:**

Open `.env` in your code editor and update:

```dotenv
# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ACTUAL_API_KEY_HERE
PRIVATE_KEY=your_actual_private_key_without_0x_prefix

# Server-Only IPFS (Pinata) & Encryption Secrets (never prefix with VITE_)
IPFS_API_KEY=your_pinata_api_key_here
IPFS_SECRET_KEY=your_pinata_secret_key_here
CREDENTIAL_MASTER_KEY=your_long_random_aes256_master_secret_here

# Contract Addresses (Will be filled after deployment)
CONTRACT_ADDRESS=

# Frontend Environment Variables (Will be updated in Step 5)
VITE_CONTRACT_ADDRESS=
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

**Important Notes:**
- Replace `YOUR_ACTUAL_API_KEY_HERE` with your Alchemy API key
- Private key should NOT include the `0x` prefix
- Leave `CONTRACT_ADDRESS` empty for now (will be filled after deployment)

4. **Verify `.env` is in `.gitignore`:**

```bash
# Check if .env is ignored
Get-Content .gitignore | Select-String ".env"
```

You should see `.env` listed. ✅

---

### Step 3.2: Configure Frontend Environment

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Create frontend `.env` file:**

```bash
# Copy the example file
Copy-Item .env.example .env
```

3. **Edit `frontend/.env` file:**

Open `frontend/.env` and configure for Sepolia:

```dotenv
# Contract Address (Will be updated after deployment in Step 5)
VITE_CONTRACT_ADDRESS=

# Network Configuration for Sepolia
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia

# Public IPFS Gateway & RPC (Never store Pinata secrets under VITE_*)
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

4. **Return to project root:**

```bash
cd ..
```

---

## 4. Deploy Smart Contract

### Step 4.1: Final Pre-Deployment Checks

```bash
# 1. Verify you're in project root
Get-Location

# 2. Check your Sepolia ETH balance
# Open MetaMask, switch to Sepolia, check balance >= 0.05 ETH

# 3. Compile contracts (ensure everything is up to date)
npm run compile

# 4. Run tests (optional but recommended)
npm run test
```

Expected output:
```
✓ All tests should pass
```

---

### Step 4.2: Deploy to Sepolia

**Run the deployment command:**

```bash
npm run deploy:sepolia
```

**Expected Output:**

```
🚀 Deploying AcademicCredential contract...

📍 Deploying with account: 0xYourWalletAddress
💰 Account balance: 0.1234 ETH

⏳ Deploying contract...
✅ AcademicCredential deployed to: 0xNewContractAddress123456789
🔑 Admin address: 0xYourWalletAddress

============================================================
📋 DEPLOYMENT SUMMARY
============================================================
Contract Address: 0xNewContractAddress123456789
Network: sepolia
Deployer: 0xYourWalletAddress
============================================================
```

**⚠️ IMPORTANT:** Copy the **Contract Address** (0xNewContractAddress123456789)!

---

### Step 4.3: Save Contract Address

1. **The deployment automatically saves to `deployments/sepolia.json`**

2. **Verify the deployment file:**

```bash
Get-Content deployments\sepolia.json
```

3. **Copy the contract address** - you'll need it for Step 5!

---

### Step 4.4: View on Etherscan

Check your deployed contract on Sepolia Etherscan:

1. **Open:** [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
2. **Search** for your contract address
3. **Verify** you can see:
   - Contract creation transaction ✅
   - Your deployer address ✅
   - Contract balance (should be 0) ✅

---

## 5. Configure Frontend

### Step 5.1: Update Frontend Environment

1. **Edit `frontend/.env` with deployed contract address:**

```dotenv
# Update this line with your deployed contract address
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere

# These should already be set (Pinata secrets stay server-side in IPFS_API_KEY / IPFS_SECRET_KEY)
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

2. **Also update root `.env` if needed:**

```dotenv
CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
```

---

### Step 5.2: Update Contract Configuration

1. **Open:** `frontend/src/config/contract.js`

2. **Verify it exports the contract address from environment variables:**

The file should automatically use `import.meta.env.VITE_CONTRACT_ADDRESS`

3. **Copy Contract ABI:**

The ABI is automatically available from:
```
artifacts/contracts/AcademicCredential.sol/AcademicCredential.json
```

The frontend should already be configured to use this.

---

### Step 5.3: Configure MetaMask for Sepolia

1. **Open MetaMask**

2. **Add/Switch to Sepolia Network:**
   - Click network dropdown
   - Select "Sepolia test network"
   - If not visible, enable it in Settings → Advanced → Show test networks

3. **Verify Sepolia Network Details:**
   - Network Name: **Sepolia test network**
   - RPC URL: `https://sepolia.infura.io/v3/...` (auto-configured)
   - Chain ID: **11155111**
   - Currency Symbol: **SepoliaETH**
   - Block Explorer: `https://sepolia.etherscan.io`

---

### Step 5.4: Start Frontend

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Open browser:** [http://localhost:5173/](http://localhost:5173/)

---

## 6. Verify Contract (Optional but Recommended)

Contract verification allows anyone to read your contract source code on Etherscan.

### Step 6.1: Get Etherscan API Key

1. **Visit:** [https://etherscan.io/](https://etherscan.io/)
2. **Sign up/Login**
3. **Go to:** API Keys section
4. **Create** new API key
5. **Copy** the API key

### Step 6.2: Add to hardhat.config.js

Edit `hardhat.config.js` and add:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // ... existing networks ...
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  },
  // ... rest of config ...
};
```

### Step 6.3: Add Etherscan API Key to .env

```dotenv
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Step 6.4: Verify Contract

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <ADMIN_ADDRESS>
```

Replace:
- `<CONTRACT_ADDRESS>` with your deployed contract address
- `<ADMIN_ADDRESS>` with your deployer wallet address

**Example:**
```bash
npx hardhat verify --network sepolia 0x123...abc 0x456...def
```

**Expected Output:**
```
Successfully verified contract AcademicCredential on Etherscan.
https://sepolia.etherscan.io/address/0xYourContractAddress#code
```

---

## 7. Test Deployment

### Step 7.1: Test Wallet Connection

1. **Open** [http://localhost:5173/](http://localhost:5173/)
2. **Click** "Connect Wallet"
3. **Approve** connection in MetaMask
4. **Verify:**
   - Wallet address displays ✅
   - Connected to Sepolia network ✅
   - No console errors ✅

---

### Step 7.2: Test Credential Issuance (If You're Admin)

1. **Navigate** to "Issue Credential" page
2. **Fill in** student details:
   - Student Address: (use another wallet or your own)
   - Name: John Doe
   - Degree: Bachelor of Science
   - Major: Computer Science
   - Graduation Date: 2024-05-15
   - IPFS Hash: (test hash or leave for auto-upload)
   - GPA: 3.8

3. **Click** "Issue Credential"
4. **Approve** transaction in MetaMask
5. **Wait** for confirmation
6. **Verify** on Etherscan:
   - Go to your contract on Sepolia Etherscan
   - Check "Transactions" tab
   - See the issuance transaction ✅

---

### Step 7.3: Test Credential Verification

1. **Navigate** to "Verify Credential" page
2. **Enter** Token ID (usually starts at 1)
3. **Click** "Verify"
4. **Check** credential details display:
   - Student name ✅
   - Degree information ✅
   - Issuance date ✅
   - Revocation status ✅

---

### Step 7.4: Test Dashboard

1. **Navigate** to "Dashboard"
2. **View** credentials (if you issued any to your wallet)
3. **Verify** all credential cards display correctly

---

## 8. Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution:**
- Get more Sepolia ETH from faucets
- Check balance in MetaMask
- Wait and try again

---

### Issue: "Network mismatch" or "Wrong network"

**Solution:**
1. Check MetaMask is on Sepolia network
2. Verify `VITE_NETWORK_ID=11155111` in frontend/.env
3. Clear browser cache and refresh
4. Restart frontend server

---

### Issue: "Transaction failed"

**Solution:**
1. Check you have issuer role (deployer has it by default)
2. Verify contract address is correct
3. Check transaction on Etherscan for error details
4. Ensure sufficient gas

---

### Issue: "Cannot connect to wallet"

**Solution:**
1. Ensure MetaMask is installed and unlocked
2. Refresh the page
3. Check browser console for errors
4. Try different browser

---

### Issue: "IPFS upload fails"

**Solution:**
1. Verify Pinata API keys are correct
2. Check Pinata dashboard for quota
3. Try uploading a smaller file
4. Check internet connection

---

### Issue: "Contract not found"

**Solution:**
1. Verify contract address in frontend/.env
2. Check deployment was successful
3. Verify on Sepolia Etherscan
4. Restart frontend server after .env changes

---

## 🎉 Deployment Complete!

### ✅ Checklist - What You've Accomplished:

- [x] Set up Alchemy account and got RPC URL
- [x] Set up Pinata for IPFS storage
- [x] Got Sepolia test ETH
- [x] Configured environment variables
- [x] Deployed smart contract to Sepolia
- [x] Configured frontend for Sepolia
- [x] Tested all functionality
- [x] (Optional) Verified contract on Etherscan

---

## 📝 Important Information to Save:

**Save these details for future reference:**

```
=== SEPOLIA DEPLOYMENT INFO ===

Contract Address: 0xYourContractAddress
Network: Sepolia Testnet (Chain ID: 11155111)
Deployer Address: 0xYourWalletAddress
Etherscan URL: https://sepolia.etherscan.io/address/0xYourContractAddress

Frontend URL: http://localhost:5173/ (development)
IPFS Gateway: https://gateway.pinata.cloud/ipfs/

=== API KEYS (Keep Secure!) ===
Alchemy API Key: YOUR_KEY
Pinata API Key: YOUR_KEY
Pinata Secret: YOUR_SECRET

=== DEPLOYMENT DATE ===
Date: [Today's Date]
Block Number: [Check Etherscan]
```

---

## 🚀 Next Steps

### For Production Deployment:

1. **Deploy to Mainnet** (when ready):
   - Get real ETH for gas fees
   - Update environment variables
   - Deploy with same process
   - ⚠️ **Use extra caution with mainnet!**

2. **Deploy Frontend**:
   - Build: `npm run build`
   - Deploy to: Vercel, Netlify, or AWS
   - Configure custom domain

3. **Security Audit**:
   - Have contract audited
   - Review access controls
   - Test thoroughly

---

## 📚 Additional Resources

- **Sepolia Etherscan:** [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
- **Alchemy Documentation:** [https://docs.alchemy.com/](https://docs.alchemy.com/)
- **Hardhat Documentation:** [https://hardhat.org/docs](https://hardhat.org/docs)
- **MetaMask Support:** [https://support.metamask.io/](https://support.metamask.io/)
- **Pinata Documentation:** [https://docs.pinata.cloud/](https://docs.pinata.cloud/)

---

## ⚠️ Security Reminders

1. **NEVER** commit `.env` files to GitHub
2. **NEVER** share private keys
3. **Use test wallets** for testnet deployments
4. **Keep API keys** secure
5. **Verify** all transactions before confirming
6. **Backup** your wallet seed phrase

---

**Need Help?** 
- Check [README.md](README.md) for general documentation
- Check [INSTALL.md](INSTALL.md) for installation issues
- Review [Troubleshooting](#troubleshooting) section above
- Open an issue on GitHub with error details

---

**Congratulations on deploying to Sepolia! 🎉**
