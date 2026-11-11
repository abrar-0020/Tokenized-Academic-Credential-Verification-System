const axios = require("axios");
const crypto = require("crypto");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const DISALLOWED_PLAINTEXT_KEYS = [
  "studentName",
  "enrollmentNumber",
  "degree",
  "grade",
  "branch",
  "fieldOfStudy",
  "field",
  "institution",
];

function generateUniqueCredentialId() {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TC-CRED-${year}-${suffix}`;
}

function assertEncryptedEnvelope(metadata) {
  if (!metadata || typeof metadata !== "object") {
    throw new Error("Invalid credential metadata object.");
  }
  const leakedKeys = DISALLOWED_PLAINTEXT_KEYS.filter(
    (key) => metadata[key] !== undefined && metadata[key] !== null && String(metadata[key]).trim() !== ""
  );
  if (leakedKeys.length > 0 || !metadata.isEncrypted || !metadata.encryptedData?.ciphertext) {
    throw new Error(
      leakedKeys.length > 0
        ? `Refusing plaintext IPFS upload. Disallowed public fields present: ${leakedKeys.join(", ")}`
        : "Refusing unencrypted IPFS upload. Missing AES-256-GCM encryptedData payload."
    );
  }
}

/**
 * Upload strictly encrypted JSON metadata envelope to Pinata IPFS
 * @param {Object} metadata - The AES-256-GCM encrypted envelope to upload
 * @returns {Promise<string>} IPFS URI (ipfs://...)
 */
async function uploadToPinata(metadata) {
  assertEncryptedEnvelope(metadata);

  const PINATA_API_KEY = process.env.IPFS_API_KEY || process.env.PINATA_API_KEY;
  const PINATA_SECRET_KEY = process.env.IPFS_SECRET_KEY || process.env.PINATA_SECRET_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not found in .env file");
  }

  try {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const safePinName = `tokcred-${String(metadata.credentialId || "confidential").replace(/[^a-zA-Z0-9_-]/g, "")}-${Date.now()}`;

    const response = await axios.post(
      url,
      {
        pinataContent: metadata,
        pinataMetadata: { name: safePinName },
      },
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUri = `ipfs://${ipfsHash}`;

    console.log("✅ Encrypted envelope uploaded to IPFS:", ipfsUri);
    console.log("🔗 Gateway URL:", `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

    return ipfsUri;
  } catch (error) {
    console.error("❌ Error uploading to Pinata:", error.message);
    throw error;
  }
}

/**
 * Upload file to Pinata IPFS
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<string>} IPFS URI (ipfs://...)
 */
async function uploadFileToPinata(filePath) {
  const PINATA_API_KEY = process.env.IPFS_API_KEY || process.env.PINATA_API_KEY;
  const PINATA_SECRET_KEY = process.env.IPFS_SECRET_KEY || process.env.PINATA_SECRET_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not found in .env file");
  }

  try {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    const response = await axios.post(url, data, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    const ipfsHash = response.data.IpfsHash;
    const ipfsUri = `ipfs://${ipfsHash}`;

    console.log("✅ File uploaded to IPFS:", ipfsUri);
    console.log("🔗 Gateway URL:", `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

    return ipfsUri;
  } catch (error) {
    console.error("❌ Error uploading file to Pinata:", error.message);
    throw error;
  }
}

/**
 * Build a privacy-preserving AES-256-GCM encrypted credential envelope (zero plaintext PII on IPFS)
 * bound to holder wallet + enrollment number + unique credentialId.
 * @param {Object} params - Credential parameters
 * @returns {Promise<Object>} Encrypted public IPFS v2 envelope
 */
async function createCredentialMetadata({
  credentialId,
  studentAddress,
  holderWallet,
  enrollmentNumber,
  studentName,
  institution,
  degree,
  branch = "",
  fieldOfStudy = "",
  grade,
  issueDate,
  description = "",
}) {
  const targetWallet = studentAddress || holderWallet;
  const cleanCredentialId = String(credentialId || generateUniqueCredentialId()).trim();
  const { buildPublicEncryptedEnvelope } = await import("../api/credential-crypto.js");

  return buildPublicEncryptedEnvelope({
    credentialId: cleanCredentialId,
    studentAddress: targetWallet,
    sensitiveData: {
      studentName,
      enrollmentNumber,
      institution,
      degree,
      branch: branch || fieldOfStudy,
      fieldOfStudy: fieldOfStudy || branch,
      grade,
      issueDate,
      description,
    },
  });
}

// Example usage
async function main() {
  console.log("📤 Encrypted IPFS Upload Helper\n");

  const sampleWallet = process.argv[2] || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const metadata = await createCredentialMetadata({
    credentialId: generateUniqueCredentialId(),
    studentAddress: sampleWallet,
    enrollmentNumber: "REG-2026-0001",
    studentName: "John Doe",
    institution: "MIT",
    degree: "Bachelor of Science",
    branch: "Computer Science",
    grade: "A",
    issueDate: "2024-05-15",
    description: "Bachelor's degree in Computer Science with honors",
  });

  console.log("🔒 Encrypted Public IPFS Envelope:", JSON.stringify(metadata, null, 2));
  console.log("\nUploading to IPFS...\n");

  const ipfsUri = await uploadToPinata(metadata);
  console.log("\n✨ Upload complete!");
  console.log("Use this URI when calling issueCredential():", ipfsUri);
}

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
}

module.exports = {
  uploadToPinata,
  uploadFileToPinata,
  createCredentialMetadata,
  generateUniqueCredentialId,
  assertEncryptedEnvelope,
};
