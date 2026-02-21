# 🎓 Tokenized Academic Credential Verification System

A production-ready, secure, and decentralized blockchain-based system for issuing, managing, and verifying academic credentials using Soulbound NFTs (non-transferable tokens).

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.19.5-yellow)
![React](https://img.shields.io/badge/React-18.2.0-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌐 Live Deployment

**🔗 Production Site:** [https://tokcred.vercel.app](https://tokcred.vercel.app)  
**📜 Smart Contract:** [0x7B5206a636d9D0819E469fA4dfABF0BE062e0297](https://sepolia.etherscan.io/address/0x7B5206a636d9D0819E469fA4dfABF0BE062e0297)  
**🌍 Network:** Sepolia Testnet (Chain ID: 11155111)  
**⚡ Status:** ✅ Live and Production-Ready

### Access the Live Application:
1. Visit [https://tokcred.vercel.app](https://tokcred.vercel.app)
2. Install MetaMask browser extension
3. Switch to Sepolia test network
4. Connect your wallet and start using the platform!

**For Students:** Get your academic credentials verified on the blockchain  
**For Institutions:** Issue tamper-proof, verifiable credentials to students

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Frontend Setup](#frontend-setup)
- [Usage Guide](#usage-guide)
- [Smart Contract Details](#smart-contract-details)
- [Security Features](#security-features)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Quick Start

**👉 New to this project? Start here:**

1. **Installation:** See **[INSTALL.md](INSTALL.md)** for one-command installation (like `pip install -r requirements.txt`)
2. **Setup Checklist:** See **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** for step-by-step setup tracking
3. **Dependencies:** See **[requirements.txt](requirements.txt)** for complete list of all dependencies
4. **Sepolia Deployment:** See **[SEPOLIA_DEPLOYMENT.md](SEPOLIA_DEPLOYMENT.md)** for complete deployment guide to testnet
5. **Production Deployment:** See **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** for deploying to production with custom domain

---

## 📦 How to Download All Dependencies at Once

Users can install **all dependencies** (backend + frontend) with a single command, just like `pip install -r requirements.txt` in Python projects.

### Method 1: Installation Scripts (Easiest) ⭐

**Windows (PowerShell):**
```powershell
# Clone repository
git clone https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System.git
cd Tokenized-Academic-Credential-Verification-System

# Run installation script
.\install.ps1
```

**Linux/Mac (Terminal):**
```bash
# Clone repository
git clone https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System.git
cd Tokenized-Academic-Credential-Verification-System

# Make script executable and run
chmod +x install.sh
./install.sh
```

This automatically installs both backend and frontend dependencies and verifies the installation!

### Method 2: Using npm Command

```bash
# Clone repository
git clone https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System.git
cd Tokenized-Academic-Credential-Verification-System

# Install all dependencies (one command)
npm run install-all
```

### Method 3: Manual Installation

```bash
# Clone repository
git clone https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System.git
cd Tokenized-Academic-Credential-Verification-System

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## 🌟 Overview

This system enables educational institutions to issue tamper-proof, verifiable academic credentials as NFTs on the Ethereum blockchain. These credentials are **Soulbound** (non-transferable), ensuring they remain permanently tied to the recipient's wallet address.

### Key Benefits

- ✅ **Immutable & Tamper-Proof**: Once issued, credentials cannot be altered or forged
- ✅ **Instant Verification**: Anyone can verify credentials in seconds without intermediaries
- ✅ **Non-Transferable**: Soulbound tokens prevent credential trading or selling
- ✅ **Global Accessibility**: Credentials accessible from anywhere in the world
- ✅ **Cost-Effective**: Eliminates paperwork and manual verification processes
- ✅ **Privacy-Preserving**: Students control who can view their credentials

## 🚀 Features

### For Institutions (Issuers)
- Issue digital credentials as ERC-721 NFTs
- Revoke credentials when necessary
- Role-based access control
- Batch processing support
- IPFS metadata storage

### For Students
- Receive and own credentials permanently
- View all credentials in a dashboard
- Share verification links
- Non-transferable ownership

### For Employers/Verifiers
- Instant credential verification by Token ID
- View complete credential details
- Check revocation status
- Access public verification portal

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐
│   Institution   │──────│  Smart Contract  │
│   (Issuer)      │      │   (Blockchain)   │
└─────────────────┘      └──────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
  ┌──────────┐          ┌──────────┐         ┌──────────┐
  │ Student  │          │   IPFS   │         │ Employer │
  │ Wallet   │          │ Metadata │         │ Verifier │
  └──────────┘          └──────────┘         └──────────┘
```

### Data Flow

1. **Issuance**: Institution uploads metadata to IPFS → Calls `issueCredential()` → NFT minted to student
2. **Verification**: Verifier enters Token ID → Contract returns credential data → Metadata fetched from IPFS
3. **Revocation**: Institution calls `revokeCredential()` → Status updated on-chain

## 🛠️ Tech Stack

### Blockchain & Smart Contracts
- **Solidity**: ^0.8.20
- **Hardhat**: ^2.19.5
- **OpenZeppelin**: ^5.0.1 (ERC721, AccessControl)
- **Token Standard**: ERC-721 (Soulbound/Non-transferable)

### Frontend
- **Framework**: React 18.2 + Vite
- **Web3 Library**: ethers.js v6
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Wallet**: MetaMask integration

### Storage & Infrastructure
- **Metadata Storage**: IPFS (Pinata)
- **Networks**: Localhost (Hardhat) + Sepolia Testnet

## 📁 Project Structure

```
tokenized-academic-credentials/
├── contracts/
│   └── AcademicCredential.sol      # Main smart contract
├── scripts/
│   ├── deploy.js                   # Deployment script
│   ├── uploadToIPFS.js             # IPFS upload helper
│   └── issueCredential.js          # Example credential issuance
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── CredentialCard.jsx
│   │   ├── pages/                  # Application pages
│   │   │   ├── Home.jsx
│   │   │   ├── IssueCredential.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── VerifyCredential.jsx
│   │   ├── context/                # React context
│   │   │   └── Web3Context.jsx
│   │   ├── config/                 # Configuration
│   │   │   └── contract.js
│   │   ├── utils/                  # Helper functions
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── hardhat.config.js
├── package.json
├── .env.example
├── .gitignore
├── metadata-example.json
└── README.md
```

## 📦 Prerequisites

> 💡 **For detailed setup instructions, see [INSTALL.md](INSTALL.md)**

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**: Latest version
- **MetaMask**: Browser extension
- **Git**: Latest version

### Additional Requirements
- **Alchemy Account**: For Sepolia testnet deployment
- **Pinata Account**: For IPFS metadata storage
- **Sepolia Test ETH**: From faucet for testnet transactions

### Check Prerequisites

```bash
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
git --version
```

## 💻 Installation

### Quick Installation (One Command)

#### Option 1: Using Installation Script (Recommended)

**Windows (PowerShell):**
```powershell
# Clone repository
git clone https://github.com/yourusername/tokenized-academic-credentials.git
cd tokenized-academic-credentials

# Run installation script
.\install.ps1
```

**Linux/Mac:**
```bash
# Clone repository
git clone https://github.com/yourusername/tokenized-academic-credentials.git
cd tokenized-academic-credentials

# Make script executable and run
chmod +x install.sh
./install.sh
```

#### Option 2: Using npm Command

```bash
# Clone repository
git clone https://github.com/yourusername/tokenized-academic-credentials.git
cd tokenized-academic-credentials

# Install all dependencies (backend + frontend)
npm run install-all
```

### Manual Installation (Step by Step)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tokenized-academic-credentials.git
cd tokenized-academic-credentials
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## ⚙️ Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=your_wallet_private_key_here

# IPFS Configuration (Pinata)
IPFS_API_KEY=your_pinata_api_key
IPFS_SECRET_KEY=your_pinata_secret_key
```

### 3. Get Required API Keys

#### Alchemy API Key (for Sepolia)
1. Visit [https://www.alchemy.com/](https://www.alchemy.com/)
2. Create account and new app
3. Select "Ethereum" → "Sepolia"
4. Copy API key

#### Pinata API Keys (for IPFS)
1. Visit [https://www.pinata.cloud/](https://www.pinata.cloud/)
2. Create account
3. Go to API Keys section
4. Generate new key with pinning permissions
5. Copy API Key and Secret

### 4. Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_NETWORK_ID=31337
VITE_NETWORK_NAME=localhost

# IPFS Configuration
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Optional: Pinata credentials for real IPFS uploads
# Leave empty for local dev (uses localStorage simulation)
VITE_PINATA_API_KEY=
VITE_PINATA_API_SECRET=
```

**Gateway URL Format**: The IPFS gateway URL must follow this structure:
```
https://gateway.pinata.cloud/ipfs/QmHash...
       ↑         ↑         ↑     ↑
   Subdomain  Domain    Path   Hash
```

The `.env` contains the base URL (`https://gateway.pinata.cloud/ipfs/`) - the hash is automatically appended by the application when accessing files.

## 🚀 Deployment

### Deploy to Local Network (Hardhat)

#### 1. Start Local Hardhat Node

```bash
npm run node
```

Keep this terminal running. In a new terminal:

#### 2. Deploy Contract

```bash
npm run deploy:local
```

#### 3. Copy Contract Address

The deployment will output the contract address. Copy it to `frontend/.env`:

```env
VITE_CONTRACT_ADDRESS=<deployed_contract_address>
```

### Deploy to Sepolia Testnet

> 📘 **For complete step-by-step deployment guide, see [SEPOLIA_DEPLOYMENT.md](SEPOLIA_DEPLOYMENT.md)**
> 
> The guide includes:
> - Detailed setup for Alchemy & Pinata accounts
> - Environment configuration
> - Contract deployment & verification
> - Frontend configuration
> - Testing procedures
> - Troubleshooting tips

#### Quick Deployment Steps:

#### 1. Get Sepolia ETH

- Visit [Sepolia Faucet](https://sepoliafaucet.com/) or [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- Enter your wallet address
- Request test ETH (~0.1 ETH needed)

#### 2. Configure Environment

```bash
# Copy and edit .env with your Alchemy RPC URL and private key
cp .env.example .env
```

#### 3. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

#### 4. Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <ADMIN_ADDRESS>
```

#### 5. Update Frontend Config

Update `frontend/.env`:

```env
VITE_CONTRACT_ADDRESS=<sepolia_contract_address>
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia
```

## 🖥️ Frontend Setup

### 1. Start Development Server

```bash
cd frontend
npm run dev
```

The application will open at `http://localhost:3000`

### 2. Connect MetaMask

1. Click "Connect Wallet"
2. Approve connection in MetaMask
3. Select correct network (localhost or Sepolia)

### 3. Switch Network in MetaMask

**For Localhost:**
- Network Name: Localhost 8545
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency: ETH

**For Sepolia:**
- Network Name: Sepolia
- Chain ID: 11155111

## 📖 Usage Guide

### For Institutions (Issuers)

#### 1. Grant Issuer Role

Deploy account has admin and issuer roles by default. To grant issuer role to another address:

```javascript
const contract = await ethers.getContractAt("AcademicCredential", CONTRACT_ADDRESS);
const ISSUER_ROLE = await contract.ISSUER_ROLE();
await contract.grantRole(ISSUER_ROLE, "0x...address");
```

#### 2. Issue Credential

**Via Frontend:**
1. Navigate to "Issue Credential" page
2. Fill in student details
3. Enter student's wallet address
4. Click "Issue Credential"
5. Confirm transaction in MetaMask

**Via Script:**

```bash
node scripts/issueCredential.js <student_address>
```

### For Students

#### View Credentials

1. Navigate to "Dashboard"
2. Connect wallet
3. View all owned credentials
4. Share verification links

### For Employers/Verifiers

#### Verify Credential

1. Navigate to "Verify" page
2. Enter Token ID
3. Connect wallet (view-only, no transaction needed)
4. View credential details and status

## 🔐 Smart Contract Details

### Main Functions

#### `issueCredential(address student, string memory metadataURI)`
- **Access**: ISSUER_ROLE only
- **Description**: Issues new credential NFT to student
- **Parameters**:
  - `student`: Recipient's wallet address
  - `metadataURI`: IPFS URI containing metadata
- **Returns**: Token ID
- **Events**: Emits `CredentialIssued`

#### `revokeCredential(uint256 tokenId)`
- **Access**: ISSUER_ROLE only
- **Description**: Marks credential as revoked
- **Parameters**: `tokenId` - ID of credential to revoke
- **Events**: Emits `CredentialRevoked`

#### `verifyCredential(uint256 tokenId)`
- **Access**: Public view
- **Description**: Returns complete credential details
- **Returns**: Credential struct

#### `getStudentCredentials(address student)`
- **Access**: Public view
- **Description**: Returns all token IDs owned by student
- **Returns**: Array of token IDs

### Security Features

✅ **Non-Transferable**: Overrides `_update()` to prevent transfers
✅ **Role-Based Access**: Only issuers can mint and revoke
✅ **Input Validation**: Validates all inputs (no zero addresses, empty strings)
✅ **Duplicate Prevention**: Uses metadata hash to prevent duplicate issuance
✅ **Gas Optimized**: Efficient mappings and state variables
✅ **Event Logging**: All actions emit events for transparency

### Metadata Structure

```json
{
  "name": "Bachelor of Science in Computer Science - John Doe",
  "description": "Academic credential issued by MIT",
  "institution": "Massachusetts Institute of Technology",
  "studentName": "John Doe",
  "degree": "Bachelor of Science in Computer Science",
  "grade": "A (3.9/4.0 GPA)",
  "issueDate": "2024-05-15",
  "image": "ipfs://Qm.../certificate.png",
  "attributes": [
    {
      "trait_type": "Institution",
      "value": "MIT"
    },
    {
      "trait_type": "Degree",
      "value": "BS Computer Science"
    }
  ]
}
```

## 🧪 Testing

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Check Contract Size

```bash
npx hardhat size-contracts
```

## 🐛 Troubleshooting

### Common Issues

#### MetaMask Connection Failed
- **Solution**: Ensure MetaMask is installed and unlocked
- Check correct network is selected
- Try refreshing the page

#### Transaction Failed
- **Solution**: Ensure you have enough gas
- Check if you have required role (for issuer functions)
- Verify contract address is correct

#### Metadata Not Loading
- **Solution**: Check IPFS gateway is accessible
- Verify metadata URI format is correct
- Try alternative IPFS gateway

#### Wrong Network
- **Solution**: Switch MetaMask to correct network
- Update `VITE_NETWORK_ID` in frontend `.env`

### Get Help

If you encounter issues:
1. Check console logs (F12 in browser)
2. Review transaction on block explorer
3. Verify contract deployment
4. Check environment variables

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat for development framework
- React and Vite for frontend framework
- Tailwind CSS for styling
- IPFS/Pinata for decentralized storage

## 📞 Contact

For questions or support:
- Create an issue on GitHub
- Email: doaminexpansion@gmail.com

---

**Built with ❤️ using Solidity, React, and Web3**
