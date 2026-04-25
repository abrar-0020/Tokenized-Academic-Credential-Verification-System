import { ethers } from 'ethers';
const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
const address = '0x4b948b20C17E793021835a3423B42A2da71E96b3';

const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function verifyCredential(uint256) view returns (tuple(uint256, address, string, uint256, bool))"
];

const contract = new ethers.Contract(address, abi, provider);

async function main() {
  try {
    const name = await contract.name();
    console.log("Name:", name);
  } catch (e) {
    console.error("Name error:", e.message);
  }
  
  try {
    const symbol = await contract.symbol();
    console.log("Symbol:", symbol);
  } catch (e) {
    console.error("Symbol error:", e.message);
  }

  try {
    console.log("Calling verifyCredential(0)...");
    const cred = await contract.verifyCredential(0);
    console.log("Cred:", cred);
  } catch (e) {
    console.error("Verify error:", e.message);
  }
}

main();
