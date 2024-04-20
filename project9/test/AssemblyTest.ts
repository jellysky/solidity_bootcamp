import { viem } from "hardhat";

async function main() {
  console.log("\n", "Deploying AssemblyTest contract...");
  const testContract = await viem.deployContract("AssemblyTest");
  console.log("\n", "Contract deployed to:", testContract.address);
  const bytecode = await testContract.read.getThisCode();
  console.log("\n", "Bytecode of the contract:", bytecode);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});