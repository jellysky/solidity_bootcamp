import { viem } from "hardhat";
import { parseEther, formatEther, formatUnits } from "viem";
import { expect } from "chai";


async function main() {
    const publicClient = await viem.getPublicClient();
    const [deployer, account1, account2] = await viem.getWalletClients();

    const tokenContract = await viem.deployContract("MyToken"); // deploys with 10 * 10 ^ 8 wei
    console.log(`Contract deployed at ${tokenContract.address}`);

    const ts = await tokenContract.read.totalSupply();
    console.log(`Total supply is ${formatEther(ts)}`);

    // Fetching the role code
    const code = await tokenContract.read.MINTER_ROLE();

    // Giving role
    const roleTx = await tokenContract.write.grantRole([code, account2.account.address,]); // must grant account 2 as the MINTER
    await publicClient.waitForTransactionReceipt({ hash: roleTx });

    // calling mint function
    const mintTx = await tokenContract.write.mint([deployer.account.address, parseEther("10")], { account: account2.account }); // sends 10 ETH to deployer
    await publicClient.waitForTransactionReceipt({ hash: mintTx });
    const deployerBalance = await tokenContract.read.balanceOf([deployer.account.address]);
    console.log(`Deployer's formatted balance is ${formatEther(deployerBalance)}`);

    const [name, symbol, decimals, totalSupply] = await Promise.all([tokenContract.read.name(),tokenContract.read.symbol(),
                                                                    tokenContract.read.decimals(),tokenContract.read.totalSupply(),]);
    console.log({ name, symbol, decimals, totalSupply });

      // Sending a transaction
    // const tx = await tokenContract.write.transfer([account1.account.address,parseEther("2"),]);
    // await publicClient.waitForTransactionReceipt({ hash: tx });

    // const myBalance = await tokenContract.read.balanceOf([deployer.account.address]);
    // console.log(`My Balance is ${myBalance} decimals units`);
    // const otherBalance = await tokenContract.read.balanceOf([account1.account.address]);
    // console.log(`The Balance of Acc1 is ${otherBalance} decimals units`);

    // const myBalance = await tokenContract.read.balanceOf([deployer.account.address]);
    // console.log(`My formatted Balance is ${formatEther(myBalance)} ${symbol}`);
    // const otherBalance = await tokenContract.read.balanceOf([account1.account.address]);
    // console.log(`The formatted Balance of Acc1 is ${formatEther(otherBalance)} ${symbol}`

    // const myBalance = await tokenContract.read.balanceOf([deployer.account.address]);
    // console.log(`My Balance is ${formatUnits(myBalance, decimals)} ${symbol}`);
    // const otherBalance = await tokenContract.read.balanceOf([account1.account.address]);
    // console.log(`The Balance of Acc1 is ${formatUnits(otherBalance, decimals)} ${symbol}`);
};




main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});