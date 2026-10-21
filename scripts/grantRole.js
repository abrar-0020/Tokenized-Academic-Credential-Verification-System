require("dotenv").config();
const fs = require("fs");
const { ethers } = require("ethers");

async function main() {
  // Support args from command line or environment variables
  const args = process.argv.slice(2).filter(arg => !arg.startsWith("--"));
  const targetAddress = process.env.TARGET_ADDRESS || args[0];
  const roleType = (process.env.ROLE_TYPE || args[1] || "both").toLowerCase();

  if (!targetAddress || !ethers.isAddress(targetAddress)) {
    console.error("❌ Please provide a valid Ethereum wallet address.");
    console.log("Usage: node scripts/grantRole.js <0xWalletAddress> [both|admin|issuer]");
    console.log("Example: node scripts/grantRole.js 0x1234567890123456789012345678901234567890 both");
    process.exit(1);
  }

  // Load contract address from deployments or .env
  let contractAddress = process.env.CONTRACT_ADDRESS;
  const deploymentPath = "./deployments/sepolia.json";
  if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    contractAddress = deployment.contractAddress || contractAddress;
  }

  if (!contractAddress) {
    console.error("❌ Could not determine contract address from deployments or .env");
    process.exit(1);
  }

  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY is missing in .env");
    process.exit(1);
  }
  if (!privateKey.startsWith("0x")) {
    privateKey = "0x" + privateKey;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 RPC URL:", rpcUrl);
  console.log("👤 Admin Caller:", signer.address);
  console.log("🎯 Target Address:", targetAddress);

  const abi = [
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
    "function ISSUER_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account) public"
  ];

  const contract = new ethers.Contract(contractAddress, abi, signer);

  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  const ISSUER_ROLE = await contract.ISSUER_ROLE();

  // Check caller role
  const isCallerAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
  if (!isCallerAdmin) {
    console.error("❌ Caller " + signer.address + " does not have DEFAULT_ADMIN_ROLE on contract.");
    process.exit(1);
  }

  const grantAdmin = roleType === "admin" || roleType === "both";
  const grantIssuer = roleType === "issuer" || roleType === "both";

  if (grantAdmin) {
    const hasAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, targetAddress);
    if (hasAdmin) {
      console.log("ℹ️  Account already has DEFAULT_ADMIN_ROLE.");
    } else {
      console.log("⏳ Sending transaction to grant DEFAULT_ADMIN_ROLE...");
      const tx = await contract.grantRole(DEFAULT_ADMIN_ROLE, targetAddress);
      console.log("📝 Transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ DEFAULT_ADMIN_ROLE granted in block", receipt.blockNumber);
    }
  }

  if (grantIssuer) {
    const hasIssuer = await contract.hasRole(ISSUER_ROLE, targetAddress);
    if (hasIssuer) {
      console.log("ℹ️  Account already has ISSUER_ROLE.");
    } else {
      console.log("⏳ Sending transaction to grant ISSUER_ROLE...");
      const tx = await contract.grantRole(ISSUER_ROLE, targetAddress);
      console.log("📝 Transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ ISSUER_ROLE granted in block", receipt.blockNumber);
    }
  }

  console.log("\n🎉 Account successfully configured! Both roles verified on-chain.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error granting role:", err);
    process.exit(1);
  });
