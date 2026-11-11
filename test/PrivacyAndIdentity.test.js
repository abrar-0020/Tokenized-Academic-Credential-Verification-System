const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("Privacy, Encrypted Metadata, Unique Identity & Soulbound Binding", function () {
  let cryptoMod;
  let pinataHandler;
  let academicCredential;
  let admin;
  let issuer;
  let student;
  let outsider;
  let originalFetch;

  const SAMPLE_SENSITIVE = {
    studentName: "Aarav Sharma",
    enrollmentNumber: "2026-CS-04921",
    institution: "National Institute of Technology",
    degree: "Bachelor of Technology",
    branch: "Computer Science and Engineering",
    fieldOfStudy: "Computer Science and Engineering",
    grade: "9.42 / 10 CGPA",
    issueDate: "2026-05-20",
    description: "First Class with Distinction in Distributed Systems",
  };

  function createMockRes() {
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(k, v) {
        this.headers[k] = v;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
    return res;
  }

  async function buildSignedUnlockRequest({ signer, account, studentAddress, credentialId, tokenId = "0", nonce, timestamp }) {
    const reqNonce = nonce || `nonce-${crypto.randomUUID()}`;
    const reqTs = timestamp ?? Date.now();
    const message =
      `TokCred Confidential Credential Decryption Request\n` +
      `Credential ID: ${credentialId}\n` +
      `Token ID: ${tokenId}\n` +
      `Holder Wallet: ${studentAddress}\n` +
      `Requester Wallet: ${account}\n` +
      `Nonce: ${reqNonce}\n` +
      `Timestamp: ${reqTs}`;
    const signature = await signer.signMessage(message);
    return { nonce: reqNonce, timestamp: reqTs, message, signature };
  }

  before(async function () {
    cryptoMod = await import("../api/credential-crypto.js");
    const pinataMod = await import("../api/pinata.js");
    pinataHandler = pinataMod.default;
  });

  beforeEach(async function () {
    originalFetch = globalThis.fetch;
    [admin, issuer, student, outsider] = await ethers.getSigners();
    const AcademicCredential = await ethers.getContractFactory("AcademicCredential");
    academicCredential = await AcademicCredential.deploy(admin.address);
    await academicCredential.waitForDeployment();
    const ISSUER_ROLE = await academicCredential.ISSUER_ROLE();
    await academicCredential.grantRole(ISSUER_ROLE, issuer.address);
  });

  afterEach(function () {
    globalThis.fetch = originalFetch;
    delete process.env.PINATA_API_KEY;
    delete process.env.PINATA_SECRET_KEY;
  });

  describe("Zero-Plaintext Public IPFS Envelope (AES-256-GCM)", function () {
    it("strips all sensitive student and academic fields from public IPFS metadata", function () {
      const credentialId = "TC-CRED-2026-AB12CD";
      const envelope = cryptoMod.buildPublicEncryptedEnvelope({
        sensitiveData: SAMPLE_SENSITIVE,
        credentialId,
        studentAddress: student.address,
      });

      const serialized = JSON.stringify(envelope);

      // Zero sensitive plaintext leak in public IPFS JSON
      for (const secretValue of Object.values(SAMPLE_SENSITIVE)) {
        expect(serialized).to.not.include(secretValue);
      }
      for (const forbiddenKey of ["studentName", "enrollmentNumber", "degree", "grade", "branch", "fieldOfStudy", "institution"]) {
        expect(envelope).to.not.have.property(forbiddenKey);
      }

      expect(envelope.schema).to.equal("tokcred-credential-v2");
      expect(envelope.credentialId).to.equal(credentialId);
      expect(envelope.holder).to.equal(ethers.getAddress(student.address));
      expect(envelope.isEncrypted).to.equal(true);
      expect(envelope.encryptionStandard).to.equal("AES-256-GCM");
      expect(envelope.encryptedData.algorithm).to.equal("AES-256-GCM");
      expect(envelope.encryptedData.iv).to.have.lengthOf(24); // 12-byte IV hex
      expect(envelope.encryptedData.tag).to.have.lengthOf(32); // 16-byte AEAD tag hex
      expect(envelope.encryptedData.ciphertext).to.be.a("string").with.length.greaterThan(40);
      expect(envelope.encryptedData.payloadHash).to.match(/^0x[a-f0-9]{64}$/);
    });

    it("requires unique credentialId, valid wallet address, and enrollment number", function () {
      expect(() =>
        cryptoMod.buildPublicEncryptedEnvelope({
          sensitiveData: SAMPLE_SENSITIVE,
          credentialId: "",
          studentAddress: student.address,
        })
      ).to.throw(/credentialId/i);

      expect(() =>
        cryptoMod.buildPublicEncryptedEnvelope({
          sensitiveData: SAMPLE_SENSITIVE,
          credentialId: "TC-CRED-2026-112233",
          studentAddress: "not-an-address",
        })
      ).to.throw(/wallet address/i);

      expect(() =>
        cryptoMod.buildPublicEncryptedEnvelope({
          sensitiveData: { ...SAMPLE_SENSITIVE, enrollmentNumber: "   " },
          credentialId: "TC-CRED-2026-112233",
          studentAddress: student.address,
        })
      ).to.throw(/enrollment/i);
    });

    it("creates encrypted v2 envelopes from scripts/uploadToIPFS helper without plaintext keys", async function () {
      const { createCredentialMetadata, assertEncryptedEnvelope } = require("../scripts/uploadToIPFS");
      const envelope = await createCredentialMetadata({
        credentialId: "TC-CRED-2026-998877",
        studentAddress: student.address,
        enrollmentNumber: SAMPLE_SENSITIVE.enrollmentNumber,
        studentName: SAMPLE_SENSITIVE.studentName,
        institution: SAMPLE_SENSITIVE.institution,
        degree: SAMPLE_SENSITIVE.degree,
        branch: SAMPLE_SENSITIVE.branch,
        grade: SAMPLE_SENSITIVE.grade,
        issueDate: SAMPLE_SENSITIVE.issueDate,
        description: SAMPLE_SENSITIVE.description,
      });

      expect(() => assertEncryptedEnvelope(envelope)).to.not.throw();
      expect(() =>
        assertEncryptedEnvelope({
          studentName: "Alice",
          degree: "BSc",
          isEncrypted: false,
        })
      ).to.throw(/Refusing plaintext/i);

      const rawJson = JSON.stringify(envelope);
      expect(rawJson).to.not.include(SAMPLE_SENSITIVE.studentName);
      expect(rawJson).to.not.include(SAMPLE_SENSITIVE.enrollmentNumber);
      expect(rawJson).to.not.include(SAMPLE_SENSITIVE.degree);
      expect(rawJson).to.not.include(SAMPLE_SENSITIVE.grade);
    });
  });

  describe("Pinata Proxy Plaintext Rejection (/api/pinata)", function () {
    it("rejects unencrypted or plaintext credential payloads with HTTP 400", async function () {
      process.env.PINATA_API_KEY = "test-key";
      process.env.PINATA_SECRET_KEY = "test-secret";

      const res = createMockRes();
      await pinataHandler(
        {
          method: "POST",
          body: {
            studentName: SAMPLE_SENSITIVE.studentName,
            enrollmentNumber: SAMPLE_SENSITIVE.enrollmentNumber,
            degree: SAMPLE_SENSITIVE.degree,
            grade: SAMPLE_SENSITIVE.grade,
            institution: SAMPLE_SENSITIVE.institution,
          },
        },
        res
      );

      expect(res.statusCode).to.equal(400);
      expect(res.body.error).to.include("Refusing to upload unencrypted");
      expect(res.body.details).to.include("studentName");
      expect(res.body.details).to.include("enrollmentNumber");
    });

    it("pins encrypted v2 envelope without exposing studentName or enrollmentNumber in Pinata metadata", async function () {
      process.env.PINATA_API_KEY = "test-key";
      process.env.PINATA_SECRET_KEY = "test-secret";

      const credentialId = "TC-CRED-2026-F00DBA";
      const envelope = cryptoMod.buildPublicEncryptedEnvelope({
        sensitiveData: SAMPLE_SENSITIVE,
        credentialId,
        studentAddress: student.address,
      });

      let capturedRequestBody = null;
      globalThis.fetch = async (url, opts) => {
        capturedRequestBody = JSON.parse(opts.body);
        return {
          ok: true,
          status: 200,
          json: async () => ({ IpfsHash: "QmEncryptedTestHash123456" }),
        };
      };

      const res = createMockRes();
      await pinataHandler({ method: "POST", body: envelope }, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.IpfsHash).to.equal("QmEncryptedTestHash123456");
      expect(capturedRequestBody.pinataMetadata.name).to.include(credentialId);
      expect(capturedRequestBody.pinataMetadata.name).to.not.include(SAMPLE_SENSITIVE.studentName);
      expect(capturedRequestBody.pinataMetadata.name).to.not.include(SAMPLE_SENSITIVE.enrollmentNumber);
    });
  });

  describe("Wallet Authorization, Replay Protection & Binding Verification", function () {
    it("allows the Soulbound holder wallet to decrypt private fields including enrollmentNumber and credentialId", async function () {
      const credentialId = "TC-CRED-2026-CAFE01";
      const envelope = cryptoMod.buildPublicEncryptedEnvelope({
        sensitiveData: SAMPLE_SENSITIVE,
        credentialId,
        studentAddress: student.address,
      });

      const signed = await buildSignedUnlockRequest({
        signer: student,
        account: student.address,
        studentAddress: student.address,
        credentialId,
      });

      const auth = await cryptoMod.verifyWalletAuthorization({
        studentAddress: student.address,
        account: student.address,
        signature: signed.signature,
        message: signed.message,
        timestamp: signed.timestamp,
        nonce: signed.nonce,
        tokenId: "0",
        onChainAuthChecker: async () => ({
          checked: true,
          isIssuerOrAdmin: false,
          owner: student.address,
        }),
      });

      expect(auth.authorized).to.equal(true);
      expect(auth.role).to.equal("holder");

      const decrypted = cryptoMod.decryptSensitiveData({
        encryptedPayload: envelope.encryptedData,
        credentialId,
        studentAddress: student.address,
      });

      expect(decrypted.studentName).to.equal(SAMPLE_SENSITIVE.studentName);
      expect(decrypted.enrollmentNumber).to.equal(SAMPLE_SENSITIVE.enrollmentNumber);
      expect(decrypted.credentialId).to.equal(credentialId);
      expect(decrypted.holderWallet).to.equal(ethers.getAddress(student.address));
      expect(decrypted.degree).to.equal(SAMPLE_SENSITIVE.degree);
      expect(decrypted.grade).to.equal(SAMPLE_SENSITIVE.grade);
      expect(decrypted.institution).to.equal(SAMPLE_SENSITIVE.institution);
    });

    it("allows an authorized ISSUER_ROLE wallet to decrypt via injected on-chain check", async function () {
      const credentialId = "TC-CRED-2026-BEEF02";
      const envelope = cryptoMod.buildPublicEncryptedEnvelope({
        sensitiveData: SAMPLE_SENSITIVE,
        credentialId,
        studentAddress: student.address,
      });

      const signed = await buildSignedUnlockRequest({
        signer: issuer,
        account: issuer.address,
        studentAddress: student.address,
        credentialId,
      });

      const auth = await cryptoMod.verifyWalletAuthorization({
        studentAddress: student.address,
        account: issuer.address,
        signature: signed.signature,
        message: signed.message,
        timestamp: signed.timestamp,
        nonce: signed.nonce,
        tokenId: "0",
        onChainAuthChecker: async () => ({
          checked: true,
          isIssuerOrAdmin: true,
          owner: student.address,
        }),
      });

      expect(auth.authorized).to.equal(true);
      expect(auth.role).to.equal("issuer");

      const decrypted = cryptoMod.decryptSensitiveData({
        encryptedPayload: envelope.encryptedData,
        credentialId,
        studentAddress: student.address,
      });
      expect(decrypted.enrollmentNumber).to.equal(SAMPLE_SENSITIVE.enrollmentNumber);
    });

    it("rejects unauthorized outsider wallet and prevents nonce replay attacks", async function () {
      const credentialId = "TC-CRED-2026-DEAD03";
      const outsiderSigned = await buildSignedUnlockRequest({
        signer: outsider,
        account: outsider.address,
        studentAddress: student.address,
        credentialId,
      });

      const rejected = await cryptoMod.verifyWalletAuthorization({
        studentAddress: student.address,
        account: outsider.address,
        signature: outsiderSigned.signature,
        message: outsiderSigned.message,
        timestamp: outsiderSigned.timestamp,
        nonce: outsiderSigned.nonce,
        tokenId: "0",
        onChainAuthChecker: async () => ({
          checked: true,
          isIssuerOrAdmin: false,
          owner: student.address,
        }),
      });

      expect(rejected.authorized).to.equal(false);
      expect(rejected.reason).to.include("neither the Soulbound credential holder");

      // Holder succeeds once with a fresh nonce, then replay with same nonce fails
      const holderSigned = await buildSignedUnlockRequest({
        signer: student,
        account: student.address,
        studentAddress: student.address,
        credentialId,
      });

      const first = await cryptoMod.verifyWalletAuthorization({
        studentAddress: student.address,
        account: student.address,
        signature: holderSigned.signature,
        message: holderSigned.message,
        timestamp: holderSigned.timestamp,
        nonce: holderSigned.nonce,
        tokenId: "0",
        onChainAuthChecker: async () => ({
          checked: true,
          isIssuerOrAdmin: false,
          owner: student.address,
        }),
      });
      expect(first.authorized).to.equal(true);

      const replay = await cryptoMod.verifyWalletAuthorization({
        studentAddress: student.address,
        account: student.address,
        signature: holderSigned.signature,
        message: holderSigned.message,
        timestamp: holderSigned.timestamp,
        nonce: holderSigned.nonce,
        tokenId: "0",
        onChainAuthChecker: async () => ({
          checked: true,
          isIssuerOrAdmin: false,
          owner: student.address,
        }),
      });
      expect(replay.authorized).to.equal(false);
      expect(replay.reason).to.match(/Replay attack detected/i);
    });

    it("rejects decryption via HTTP 403 handler when wallet is unauthorized", async function () {
      const credentialId = "TC-CRED-2026-HTTP403";
      const envelope = cryptoMod.buildPublicEncryptedEnvelope({
        sensitiveData: SAMPLE_SENSITIVE,
        credentialId,
        studentAddress: student.address,
      });

      const outsiderSigned = await buildSignedUnlockRequest({
        signer: outsider,
        account: outsider.address,
        studentAddress: student.address,
        credentialId,
      });

      const res = createMockRes();
      await cryptoMod.default(
        {
          method: "POST",
          query: { action: "decrypt" },
          body: {
            encryptedPayload: envelope.encryptedData,
            credentialId,
            studentAddress: student.address,
            tokenId: "0",
            account: outsider.address,
            signature: outsiderSigned.signature,
            message: outsiderSigned.message,
            timestamp: outsiderSigned.timestamp,
            nonce: outsiderSigned.nonce,
            rpcUrl: "http://127.0.0.1:0", // unreachable offline RPC forces failure instead of false grant
          },
        },
        res
      );

      expect(res.statusCode).to.equal(403);
      expect(res.body.error).to.include("Unauthorized");
    });

    it("detects ciphertext tampering, payloadHash tampering, and holder/ID binding mismatches", function () {
      const credentialId = "TC-CRED-2026-AEAD99";
      const envelope = cryptoMod.buildPublicEncryptedEnvelope({
        sensitiveData: SAMPLE_SENSITIVE,
        credentialId,
        studentAddress: student.address,
      });

      // 1. Tamper ciphertext
      const flippedByte = envelope.encryptedData.ciphertext.slice(0, 2) === "ff" ? "00" : "ff";
      const tamperedCipher = {
        ...envelope.encryptedData,
        ciphertext: flippedByte + envelope.encryptedData.ciphertext.slice(2),
      };
      expect(() =>
        cryptoMod.decryptSensitiveData({
          encryptedPayload: tamperedCipher,
          credentialId,
          studentAddress: student.address,
        })
      ).to.throw();

      // 2. Tamper payloadHash
      const tamperedHash = {
        ...envelope.encryptedData,
        payloadHash: "0x" + "1".repeat(64),
      };
      expect(() =>
        cryptoMod.decryptSensitiveData({
          encryptedPayload: tamperedHash,
          credentialId,
          studentAddress: student.address,
        })
      ).to.throw(/payload hash verification failed/i);

      // 3. Mismatched holder wallet (key derived for student.address cannot decrypt with outsider.address)
      expect(() =>
        cryptoMod.decryptSensitiveData({
          encryptedPayload: envelope.encryptedData,
          credentialId,
          studentAddress: outsider.address,
        })
      ).to.throw();

      // 4. Mismatched credentialId
      expect(() =>
        cryptoMod.decryptSensitiveData({
          encryptedPayload: envelope.encryptedData,
          credentialId: "TC-CRED-2026-WRONG",
          studentAddress: student.address,
        })
      ).to.throw();
    });
  });

  describe("On-Chain Soulbound Wallet Ownership (AcademicCredential)", function () {
    it("binds minted credential to student wallet via ownerOf & getStudentCredentials and blocks transfers", async function () {
      await academicCredential.connect(issuer).issueCredential(student.address, "ipfs://QmEncryptedV2Envelope");

      expect(await academicCredential.ownerOf(0)).to.equal(student.address);
      const details = await academicCredential.verifyCredential(0);
      expect(details.student).to.equal(student.address);

      const ownedTokens = await academicCredential.getStudentCredentials(student.address);
      expect(ownedTokens.map((t) => Number(t))).to.deep.equal([0]);

      await expect(
        academicCredential.connect(student).transferFrom(student.address, outsider.address, 0)
      ).to.be.revertedWith("Credentials are non-transferable (Soulbound)");

      await expect(
        academicCredential.connect(student)["safeTransferFrom(address,address,uint256)"](student.address, outsider.address, 0)
      ).to.be.revertedWith("Credentials are non-transferable (Soulbound)");
    });

    it("rejects holder decryption authorization if on-chain ownerOf disagrees with studentAddress", async function () {
      const credentialId = "TC-CRED-2026-SBT01";
      const signed = await buildSignedUnlockRequest({
        signer: outsider,
        account: outsider.address,
        studentAddress: outsider.address,
        credentialId,
        tokenId: "0",
      });

      const auth = await cryptoMod.verifyWalletAuthorization({
        studentAddress: outsider.address,
        account: outsider.address,
        signature: signed.signature,
        message: signed.message,
        timestamp: signed.timestamp,
        nonce: signed.nonce,
        tokenId: "0",
        onChainAuthChecker: async () => ({
          checked: true,
          isIssuerOrAdmin: false,
          owner: student.address,
        }),
      });

      expect(auth.authorized).to.equal(false);
      expect(auth.reason).to.include("On-chain Soulbound owner");
    });
  });

  describe("Hybrid Sequential + High-Entropy Credential ID Generation", function () {
    it("generates hybrid sequential + 48-bit CSPRNG IDs when sequence is given and 64-bit IDs otherwise", function () {
      const { generateUniqueCredentialId } = require("../scripts/uploadToIPFS");
      const year = new Date().getFullYear();

      const hybrid = generateUniqueCredentialId(6);
      expect(hybrid).to.match(new RegExp(`^TC-${year}-00006-[A-F0-9]{12}$`));

      const offline = generateUniqueCredentialId();
      expect(offline).to.match(new RegExp(`^TC-${year}-[A-F0-9]{16}$`));

      const generated = new Set();
      for (let i = 0; i < 200; i++) {
        generated.add(generateUniqueCredentialId(6));
      }
      expect(generated.size).to.equal(200);
    });
  });
});
