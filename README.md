# TokCred — Tokenized Academic Credential Verification System

A production-ready, privacy-preserving, decentralized system for issuing, managing, and verifying academic credentials as non-transferable **Soulbound ERC-721 NFTs** on Ethereum Sepolia.

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.19.5-yellow)
![React](https://img.shields.io/badge/React-18.2.0-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## Live Deployment

- **Production Site:** [https://www.deoxys.in/](https://www.deoxys.in/)
- **Smart Contract (`AcademicCredential`):** [0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1](https://sepolia.etherscan.io/address/0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1)
- **Network:** Ethereum Sepolia Testnet (Chain ID: `11155111`)
- **Repository:** [abrar-0020/Tokenized-Academic-Credential-Verification-System](https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System)

### Accessing the Application
- **Public Verification (`/public-verify`):** **No wallet required.** Anyone (employers, HR systems, registrars) can verify credentials immediately by numeric **Token ID**, **Unique Credential ID (`TC-...`)**, or QR code link.
- **Issuing & Decrypting (`/institutions`, `/issue`, `/dashboard`, `/student-dashboard`):** Requires **MetaMask** connected to **Sepolia Testnet** (`ISSUER_ROLE` / `DEFAULT_ADMIN_ROLE` for issuing/revoking, or the Soulbound holder wallet to unlock encrypted v2 records). If MetaMask is missing, Connect buttons surface a direct **MetaMask not found — install MetaMask** action linking to `https://metamask.io/download/`.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Privacy & Identity Architecture](#privacy--identity-architecture)
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

## Documentation Guides

1. **Installation:** See [`INSTALL.md`](INSTALL.md)
2. **Dependencies Reference:** See [`requirements.txt`](requirements.txt)
3. **Sepolia Deployment:** See [`SEPOLIA_DEPLOYMENT.md`](SEPOLIA_DEPLOYMENT.md)
4. **Production & Vercel Deployment:** See [`PRODUCTION_DEPLOYMENT.md`](PRODUCTION_DEPLOYMENT.md)

---

## Overview

TokCred enables accredited educational institutions to mint tamper-proof, verifiable academic degrees and certificates on Ethereum Sepolia while keeping student PII off plaintext public IPFS. Each minted NFT is **Soulbound** (`_update` blocks transfers between wallets), permanently binding the credential to the recipient graduate's wallet (`ownerOf(tokenId)`).

### Key Capabilities

- **Zero-Plaintext Encrypted IPFS Envelopes (v2):** Sensitive student and academic attributes (`studentName`, `enrollmentNumber`, `degree`, `grade`, `fieldOfStudy`, `institution`) are encrypted server-side with **AES-256-GCM** via [`api/credential-crypto.js`](api/credential-crypto.js) before pinning through [`api/pinata.js`](api/pinata.js).
- **Hybrid Sequential + High-Entropy Credential ID:** Generates collision-resistant IDs (`TC-<YEAR>-<6-digit-seq>-<12-hex-CSPRNG>`, with pre-mint duplicate checks against existing issued credentials) alongside legacy `TC-TOKEN-<id>` identifiers.
- **Dual Public Lookup (`/public-verify`):** Verify credentials seamlessly using either the numeric **Token ID** (e.g., `4`) or the **Unique Credential ID** (e.g., `TC-TOKEN-2`, `TC-2026-...`), or scan a PDF certificate QR code.
- **Professional Landscape Certificate PDFs:** Generates verifiable A4 landscape degree certificates ([`frontend/src/services/certificateGenerator.js`](frontend/src/services/certificateGenerator.js)) displaying institution name, recipient, enrollment/registration number, unique Credential ID, Soulbound holder wallet, verification QR code, and registrar/VC signatures.
- **Wallet-Optional Verification:** Public verifiers and HR portals need zero wallet extensions and zero gas; issuing and decrypting encrypted v2 records authenticate via EIP-191 wallet signatures verified on-chain.

---

## Features

### For Institutions (`ISSUER_ROLE` / `DEFAULT_ADMIN_ROLE`)
- Gated institutional routes (`/dashboard`, `/issue`, `/history`) protected by pure on-chain `ISSUER_ROLE` / `DEFAULT_ADMIN_ROLE` checks ([`IssuerRouteGuard.jsx`](frontend/src/components/IssuerRouteGuard.jsx))
- Issue encrypted Soulbound credentials with live certificate preview before minting
- Pre-mint duplicate check and automatic AES-256-GCM envelope creation via `/api/credential-crypto` + `/api/pinata`
- Revoke compromised or erroneous credentials permanently on-chain
- Download certificates and batch-decrypt records in institutional history

### For Students
- Permanent non-transferable ownership bound to the graduate's Soulbound wallet
- Student Dashboard (`/student-dashboard`) to inspect owned credentials and unlock encrypted details
- Share verification URLs (`/public-verify?tokenId=<id>`) and verification QR codes
- Export formatted A4 landscape PDF certificates

### For Employers, HR Systems & Public Verifiers
- **No wallet required** on `/public-verify` and `/verify`
- Look up by **Token ID** or **Unique Credential ID (`TC-...`)**
- Instant on-chain validation of token existence, issuer authorization, revocation status (`isRevoked`), and Soulbound ownership (`ownerOf`)
- Direct read-only smart contract queries supported via any Sepolia RPC (`verifyCredential`, `isCredentialValid`, `ownerOf`) — see `/developers` and `/support`

---

## Privacy & Identity Architecture

```
┌──────────────────┐   1. Encrypt PII (AES-256-GCM)    ┌───────────────────────────┐
│   Institution    │ ────────────────────────────────▶ │  /api/credential-crypto   │
│  (ISSUER_ROLE)   │                                   └─────────────┬─────────────┘
└────────┬─────────┘                                                 │
         │ 3. issueCredential(studentWallet, ipfs://...)             ▼ 2. Reject plaintext & pin v2 envelope
         ▼                                             ┌───────────────────────────┐
┌──────────────────┐                                   │  /api/pinata -> IPFS      │
│ AcademicCredential│                                   └─────────────┬─────────────┘
│  (Sepolia SBT)   │                                                 │
└────────┬─────────┘                                                 ▼
         │ 4a. Public verify (no wallet): status + non-PII    ┌──────────────────┐
         └──────────────────────────────────────────────────▶ │  /public-verify  │
           4b. Unlock v2 PII: wallet signature verified on    │  /student-       │
               ownerOf / ISSUER_ROLE via /api/credential-crypto│  dashboard       │
                                                              └──────────────────┘
```

1. **Issuance:** UI / CLI script computes a hybrid `credentialId`, checks duplicates, encrypts sensitive fields server-side (`AES-256-GCM` bound to `credentialId` + `studentAddress` + `enrollmentNumber`), pins only the encrypted v2 JSON envelope via `/api/pinata`, and mints the Soulbound ERC-721 token on Sepolia.
2. **Public Verification (No Wallet Needed):** Anyone enters a Token ID or `TC-...` Credential ID on `/public-verify`. The app reads Sepolia on-chain state (`verifyCredential`, `isCredentialValid`, `ownerOf`) and fetches IPFS metadata. Legacy v1 records render full details directly; v2 encrypted records prove validity immediately without exposing student PII until unlocked.
3. **Authorized Decryption:** The Soulbound holder (`ownerOf(tokenId)`) or an on-chain `ISSUER_ROLE`/`DEFAULT_ADMIN_ROLE` wallet signs a timestamped challenge (`nonce` + deadline replay protection) verified by `/api/credential-crypto` before decrypting.

---

## Tech Stack

- **Smart Contracts:** Solidity `^0.8.20`, Hardhat `^2.19.5`, OpenZeppelin Contracts `^5.0.1` (`ERC721`, `ERC721URIStorage`, `AccessControl`)
- **Frontend:** React `18.2`, Vite, Tailwind CSS, `ethers` v6, `jspdf`, `qrcode.react`
- **Serverless API (`api/`):** Node.js Vercel Serverless Functions (`api/credential-crypto.js`, `api/pinata.js`) using AES-256-GCM (`node:crypto`) + Pinata JWT/Key proxy
- **Storage & Networks:** IPFS (Pinata), Hardhat Localhost (`31337`), Ethereum Sepolia (`11155111`)

---

## Project Structure

```
DecntralizedAcademic-Credential-Verification-System/
├── api/
│   ├── credential-crypto.js          # AES-256-GCM encryption + EIP-191 wallet authorization
│   └── pinata.js                     # Server-side Pinata proxy (rejects plaintext PII)
├── contracts/
│   └── AcademicCredential.sol        # Soulbound ERC-721 + AccessControl smart contract
├── scripts/
│   ├── deploy.js                     # Hardhat deployment script
│   ├── uploadToIPFS.js               # Encrypted v2 & IPFS pinning helper
│   ├── issueCredential.js            # CLI credential issuance helper
│   └── interact.js                   # Contract interaction script
├── test/
│   ├── AcademicCredential.test.js    # 18 smart contract unit tests
│   └── PrivacyAndIdentity.test.js    # 13 encryption, Pinata, binding & hybrid ID tests
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Footer, SharedPillNav, WalletConnectButton, SettingsDropdown, IssuerRouteGuard, ...
│   │   ├── config/                   # Contract ABI, addresses, Sepolia RPC config
│   │   ├── context/                  # Web3Context & ThemeContext
│   │   ├── pages/                    # Home, PublicVerify, VerifyCredential, IssueCredential, Dashboard, History,
│   │   │                             # StudentDashboard, ForInstitutions, Features, Developers, Support, PrivacyPolicy, TermsOfService
│   │   ├── services/                 # certificateGenerator.js (A4 landscape PDF + QR)
│   │   ├── logic.js                  # Hybrid Credential IDs, dual lookup, encryption & Pinata clients
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env.production.example
│   └── package.json
├── hardhat.config.js
├── package.json
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js:** `v18.0.0` or higher (`npm` `>= 9.0.0`)
- **MetaMask:** Required only for issuing/revoking or decrypting encrypted records (not required for public verification)
- **Git**
- **Alchemy / Sepolia RPC** & **Pinata account** (for Sepolia deployment and IPFS pinning)

---

## Installation

### Windows (PowerShell)
```powershell
git clone https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System.git
cd Tokenized-Academic-Credential-Verification-System
.\install.ps1
```

### Linux / macOS
```bash
git clone https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System.git
cd Tokenized-Academic-Credential-Verification-System
chmod +x install.sh
./install.sh
```

### Using npm
```bash
git clone https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System.git
cd Tokenized-Academic-Credential-Verification-System
npm run install-all
```

---

## Configuration

> Never commit `.env`, `.env.local`, or `.env.production` files. `.gitignore` ignores all real `.env*` files while allowing only `*.example` templates. Server secrets (`PRIVATE_KEY`, `IPFS_API_KEY`, `IPFS_SECRET_KEY`, `PINATA_JWT`, `CREDENTIAL_MASTER_KEY`) must **never** be prefixed with `VITE_`.

### 1. Root Server / Hardhat `.env`
```bash
cp .env.example .env
```

```env
# Network & Deployer
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=your_wallet_private_key_here

# Server-Only IPFS (Pinata) & Encryption Secrets
IPFS_API_KEY=your_pinata_api_key
IPFS_SECRET_KEY=your_pinata_secret_key
CREDENTIAL_MASTER_KEY=your_long_random_aes256_master_secret
```

### 2. Frontend Public Configuration (`frontend/.env.local`)
```bash
cd frontend
cp .env.example .env.local
```

```env
VITE_CONTRACT_ADDRESS=0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

---

## Deployment

### Local Hardhat Network
```bash
# Terminal 1
npm run node

# Terminal 2
npm run deploy:local
```

### Sepolia Testnet
See [`SEPOLIA_DEPLOYMENT.md`](SEPOLIA_DEPLOYMENT.md) and [`PRODUCTION_DEPLOYMENT.md`](PRODUCTION_DEPLOYMENT.md) for Vercel/serverless environment variable setup (`/api/credential-crypto` and `/api/pinata`), or deploy directly:
```bash
npm run deploy:sepolia
```

---

## Frontend Setup

```bash
cd frontend
npm run dev
```

For a production build preview:
```bash
cd frontend
npm run build
npx vite preview --port 4173
```

> **Note:** Local `vite dev` / `vite preview` serves static assets only unless run through Vercel CLI (`vercel dev`) to execute `/api/credential-crypto` and `/api/pinata` serverless endpoints.

---

## Usage Guide

### 1. Onboard an Issuing Institution (`ISSUER_ROLE`)
The deployer wallet holds `DEFAULT_ADMIN_ROLE` and `ISSUER_ROLE` by default. Grant `ISSUER_ROLE` to another university wallet:
```javascript
const contract = await ethers.getContractAt("AcademicCredential", CONTRACT_ADDRESS);
const ISSUER_ROLE = await contract.ISSUER_ROLE();
await contract.grantRole(ISSUER_ROLE, "0x...institutionWallet");
```

### 2. Issue a Credential
- Connect an authorized `ISSUER_ROLE` wallet in MetaMask and visit `/issue`, or use the Hardhat CLI script (`npm run issue`).
- Fill in student details, registration/enrollment number, graduate wallet address, degree, field, and grade.
- Review the live certificate preview, confirm authorization, and sign in MetaMask to encrypt + pin to IPFS + mint on Sepolia.

### 3. Public & HR Verification (No Wallet Required)
- Open `/public-verify` (or scan the QR code on the PDF certificate).
- Enter either a **Token ID** (e.g. `4`) or a **Unique Credential ID** (e.g. `TC-TOKEN-2`).
- Verification reads Sepolia state directly with no wallet or gas required.
- Authorized credential holders or issuers can click **Connect Holder Wallet to Unlock** to verify ownership signature and decrypt v2 student records or export a full certificate PDF.

---

## Smart Contract Details

[`contracts/AcademicCredential.sol`](contracts/AcademicCredential.sol) exposes:
- `issueCredential(address student, string memory metadataURI)` (`ISSUER_ROLE`) — Mints a non-transferable Soulbound ERC-721 and emits `CredentialIssued`.
- `revokeCredential(uint256 tokenId)` (`ISSUER_ROLE`) — Permanently marks a credential revoked and emits `CredentialRevoked`.
- `verifyCredential(uint256 tokenId)` (`view`) — Returns `(student, issuer, issuedAt, isRevoked, metadataURI)`.
- `isCredentialValid(uint256 tokenId)` (`view`) — Returns `true` when existing and not revoked.
- `getStudentCredentials(address student)` (`view`) — Returns all Token IDs held by `student`.

### Security Guarantees
- **Soulbound Enforcement:** Overrides `_update()` to block secondary transfers between wallets (`mint` and `burn` semantics only).
- **Role-Based Access Control:** OpenZeppelin `AccessControl` restricts minting and revocation to `ISSUER_ROLE`.
- **Zero-Plaintext IPFS Metadata (v2):** `/api/pinata` rejects payloads containing plaintext PII (`studentName`, `enrollmentNumber`, `grade`, `degree`) and stores only encrypted envelopes (`AES-256-GCM`) plus public status/badge metadata.
- **Signature Replay Protection & Identity Binding:** Decryption challenges include a single-use nonce + timestamp window and validate on-chain `ownerOf(tokenId)` / `ISSUER_ROLE` before returning decrypted records.

---

## Testing

```bash
# Compile Solidity contracts
npx hardhat compile

# Run full test suite (31 tests: smart contracts + privacy/encryption/binding/hybrid ID)
npm test

# Build production frontend bundle
cd frontend && npm run build
```

---

## Troubleshooting

- **"MetaMask not found — install MetaMask"**: Public credential verification on `/public-verify` does not need MetaMask. To issue credentials or unlock encrypted v2 records, install the MetaMask extension from [metamask.io/download](https://metamask.io/download/) and switch to Sepolia (`11155111`).
- **Wrong Network**: Switch MetaMask to **Sepolia Testnet** (Chain ID `11155111`) or verify `VITE_NETWORK_ID` in `frontend/.env.local`.
- **Metadata Offline**: IPFS gateways can occasionally rate-limit reads; TokCred automatically falls back across multiple public IPFS gateways when reading metadata.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Open a Pull Request

---

## License

Licensed under the MIT License — see [`LICENSE`](LICENSE) for details.

## Contact & Support

- **In-App Help Center & Docs:** `/support` and `/developers`
- **GitHub Issues:** [Open an issue](https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System/issues)
- **Email:** founder@deoxys.in
