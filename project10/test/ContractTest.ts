import "dotenv/config";
import { viem } from "hardhat";
import { parseEther, formatEther } from "viem";

const FLASH_LOAN_FEE = 1000n;
const FLASH_LOAN_AMOUNT = 10n;
const flashLoanFeeString = ((FLASH_LOAN_FEE * 100n) / 10000n).toString() + "%";

async function main() {
  const publicClient = await viem.getPublicClient();
  const [signer] = await viem.getWalletClients();
  
  async function deployContracts() {
    console.log("Deploying FlashMint ERC20 Contract\n");
    const flashMintErc20Contract = await viem.deployContract("MyFlashMinter", [
      "Stonks Token",
      "Stt",
      signer.account.address,
      FLASH_LOAN_FEE,
    ]);
    console.log("Awaiting confirmations\n");
    console.log("Completed!\n");
    console.log(`Contract deployed at ${flashMintErc20Contract.address}\n`);
    console.log("Deploying FlashSwap Contract\n");
    const flashSwapContract = await viem.deployContract("MyFlashSwap", [
      flashMintErc20Contract.address,
    ]);
    console.log("Awaiting confirmations\n");
    console.log("Completed!\n");
    console.log(`Contract deployed at ${flashSwapContract.address}\n`);
    console.log("Deploying Magic Swap Faucet Contract\n");
    const magicSwapFaucetContract = await viem.deployContract("MagicSwapFaucet");
    console.log("Awaiting confirmations\n");
    console.log("Completed!\n");
    console.log(`Contract deployed at ${magicSwapFaucetContract.address}\n`);
    console.log(
      "Minting some tokens to the Magic Swap Faucet Contract at FlashMint ERC20 Contract\n"
    );
    const mintTokensTx = await flashMintErc20Contract.write.mint([
      magicSwapFaucetContract.address,
      parseEther((FLASH_LOAN_AMOUNT * 100n).toString()),
    ]);
    console.log("Awaiting confirmations\n");
    await publicClient.getTransactionReceipt({ hash: mintTokensTx });
    console.log("Completed!\n");
    return { flashMintErc20Contract, flashSwapContract, magicSwapFaucetContract };
  }

  const { flashMintErc20Contract, flashSwapContract, magicSwapFaucetContract } = await deployContracts();

  async function checkBalances() {
    console.log("Checking the current balances\n");
    const SignerBalanceBN = await flashMintErc20Contract.read.balanceOf([
      signer.account.address,
    ]);
    const SignerBalance = formatEther(SignerBalanceBN);
    const totalSupplyBN = await flashMintErc20Contract.read.totalSupply();
    const swapContractBalanceBN = await flashMintErc20Contract.read.balanceOf([
      flashSwapContract.address,
    ]);
    const magicSwapFaucetContractBalanceBN = await flashMintErc20Contract.read.balanceOf([
      magicSwapFaucetContract.address,
    ]);
    const totalSupply = formatEther(totalSupplyBN);
    const swapContractBalance = formatEther(swapContractBalanceBN);
    const magicSwapFaucetContractBalance = formatEther(
      magicSwapFaucetContractBalanceBN
    );
    console.log(`Total supply of tokens: ${totalSupply}\n`);
    console.log(
      `Current token balance of the contract deployer: ${SignerBalance} Stt\n`
    );
    console.log(
      `Current token balance inside the swap contract: ${swapContractBalance} Stt\n`
    );
    console.log(
      `Current token balance inside the magic swap faucet contract: ${magicSwapFaucetContractBalance} Stt\n`
    );
  }

  await checkBalances();

  async function doSwap() {
    console.log(
      `Initiating flash swap to borrow ${FLASH_LOAN_AMOUNT} Stt trying to profit ${FLASH_LOAN_AMOUNT / 2n} Stt\n`
    );
    const swapTx = await flashSwapContract.write.flashBorrow([
      flashMintErc20Contract.address,
      parseEther(FLASH_LOAN_AMOUNT.toString()),
      magicSwapFaucetContract.address,
      parseEther((FLASH_LOAN_AMOUNT / 2n).toString()),
    ]);
    console.log("Awaiting confirmations\n");
    const receipt = await publicClient.getTransactionReceipt({ hash: swapTx });
    const gasUsed = receipt.gasUsed;
    const gasPrice = receipt.effectiveGasPrice;
    console.log(
      `Flash Swap completed!\n\n${gasUsed} gas units spent (${formatEther(
        gasUsed * gasPrice
      )} ETH)\nPaid ${(FLASH_LOAN_AMOUNT * FLASH_LOAN_FEE) / 10000n} Stt of lending fees (${flashLoanFeeString})\n`
    );
  }

  await doSwap();

  await checkBalances();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});