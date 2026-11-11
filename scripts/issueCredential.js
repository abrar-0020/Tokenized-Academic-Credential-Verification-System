const hre = require("hardhat");
const { uploadToPinata, createCredentialMetadata, generateUniqueCredentialId } = require("./uploadToIPFS");
require("dotenv").config();

async function main() {
  console.log("🎓 Issuing Encrypted Soulbound Academic Credential\n");

  // Get contract address from deployment
  const fs = require("fs");
  const network = hre.network.name;
  const deploymentPath = `./deployments/${network}.json`;

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found. Please deploy the contract first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deployment.contractAddress;

  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", network);

  // Get signers
  const [issuer] = await hre.ethers.getSigners();
  console.log("✍️  Issuer:", issuer.address);

  // Connect to contract
  const AcademicCredential = await hre.ethers.getContractFactory("AcademicCredential");
  const contract = AcademicCredential.attach(contractAddress);

  // Pass student address, enrollment number, and optional credential ID via CLI args
  const studentAddress = process.argv[2] || issuer.address;
  const enrollmentNumber = process.argv[3] || "REG-2026-0001";
  const nextSeq = Number(await contract.getTotalCredentials());
  const credentialId = process.argv[4] || generateUniqueCredentialId(nextSeq);

  console.log("👨‍🎓 Soulbound Holder:", studentAddress);
  console.log("🪪 Enrollment No.:", enrollmentNumber);
  console.log("🔐 Credential ID:", credentialId);
  console.log("\n" + "=".repeat(60));

  // Create AES-256-GCM encrypted metadata envelope (zero plaintext PII in IPFS payload)
  const metadata = await createCredentialMetadata({
    credentialId,
    studentAddress,
    enrollmentNumber,
    studentName: "Alice Johnson",
    institution: "Massachusetts Institute of Technology",
    degree: "Bachelor of Science",
    branch: "Computer Science & AI",
    grade: "A (3.9/4.0 GPA)",
    issueDate: new Date().toISOString().split("T")[0],
    description: "Bachelor's degree in Computer Science with honors. Specialization in Artificial Intelligence and Machine Learning.",
  });

  console.log("🔒 Encrypted Public IPFS Envelope:");
  console.log(JSON.stringify(metadata, null, 2));
  console.log("=".repeat(60) + "\n");

  // Upload encrypted envelope to IPFS
  console.log("📤 Uploading encrypted envelope to IPFS...");
  const metadataURI = await uploadToPinata(metadata);

  // Issue Soulbound ERC-721 credential directly to student's wallet
  console.log("\n⏳ Issuing credential on blockchain...");
  const tx = await contract.issueCredential(studentAddress, metadataURI);
  console.log("📝 Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

  // Get token ID from event
  const event = receipt.logs.find(
    (log) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "CredentialIssued";
      } catch {
        return false;
      }
    }
  );

  let issuedTokenId = 0n;
  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    issuedTokenId = parsedEvent.args.tokenId;
    console.log("🎫 Token ID:", issuedTokenId.toString());
    console.log("\n" + "=".repeat(60));
    console.log("🎉 Credential Successfully Issued!");
    console.log("=".repeat(60));
    console.log("Token ID:", issuedTokenId.toString());
    console.log("Credential ID:", credentialId);
    console.log("Soulbound Holder:", studentAddress);
    console.log("Metadata URI:", metadataURI);
    console.log("=".repeat(60) + "\n");
  }

  // Verify the credential & Soulbound ownerOf binding
  console.log("🔍 Verifying credential...");
  const credential = await contract.verifyCredential(issuedTokenId);
  const holderOnChain = await contract.ownerOf(issuedTokenId);
  console.log("✅ Credential verified:");
  console.log("  - Student Record:", credential.student);
  console.log("  - ERC-721 ownerOf:", holderOnChain);
  console.log("  - Metadata URI:", credential.metadataURI);
  console.log("  - Issue Timestamp:", new Date(Number(credential.issueTimestamp) * 1000).toISOString());
  console.log("  - Revoked:", credential.revoked);

  console.log("\n✨ Process complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
