import {
    createPublicClient,
    http,
    createWalletClient,
    formatEther,
  } from "viem";
  import * as chains from "viem/chains";
  import { privateKeyToAccount } from "viem/accounts";
  
  const deployerPrivateKey = process.env.PRIVATE_KEY || "";
  const CUSTOM_RPC_URL = process.env.CUSTOM_RPC_URL || "";
  
  async function main() {
    const publicClient = createPublicClient({
      // chain: chains.sepolia,
      chain: chains.polygonAmoy,
      transport: http(CUSTOM_RPC_URL),
    });
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Last block number:", blockNumber);
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const deployer = createWalletClient({
      account,
      //chain: chains.sepolia,
      chain: chains.polygonAmoy,
      transport: http(CUSTOM_RPC_URL),
    });
    console.log("Deployer address:", deployer.account.address);
    const balance = await publicClient.getBalance({
      address: deployer.account.address,
    });
    console.log(
      "Deployer balance:",
      formatEther(balance),
      deployer.chain.nativeCurrency.symbol
    );
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });