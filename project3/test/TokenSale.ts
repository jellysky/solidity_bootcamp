import { expect } from "chai";
import { viem } from "hardhat"
import { parseEther, formatEther } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { int } from "hardhat/internal/core/params/argumentTypes";

const TEST_RATIO = 6n;
const TEST_PRICE = 5n;
const TEST_BUY_AMOUNT = "10"; // use parseEther to pass as ether
const TEST_SELL_AMOUNT = "3";
const TEST_TOKEN_ID = 20;
const INTMAX = 2^256-1;

async function fixture() {
  const publicClient = await viem.getPublicClient();
  const [deployer, acc1, acc2] = await viem.getWalletClients();
  const myTokenContract = await viem.deployContract("MyToken", [])
  const tokenSaleContract = await viem.deployContract("TokenSale", [TEST_RATIO, TEST_PRICE, myTokenContract.address, myTokenContract.address,]);
  const MINTER_ROLE = await myTokenContract.read.MINTER_ROLE();
  const giveRoleTx = await myTokenContract.write.grantRole([MINTER_ROLE, tokenSaleContract.address]);
  return { tokenSaleContract, myTokenContract, publicClient, deployer, acc1, acc2 };
}

describe("NFT Shop", async () => {
  describe("When the Shop contract is deployed", async () => {
// Test 1
    it("defines the ratio as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(fixture);
      const ratio = await tokenSaleContract.read.ratio();
      expect(ratio).to.be.eq(TEST_RATIO);
      // ratio in constructor equals TEST_RATIO
    })
// Test 2
    it("defines the price as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(fixture);
      const price = await tokenSaleContract.read.price();
      expect(price).to.be.eq(TEST_PRICE);
      // price in constructor equals TEST_PRICE
    });

// Test 3
    it("uses a valid ERC20 as payment token", async () => {
      const { tokenSaleContract } = await loadFixture(fixture);
      const paymentTokenAddress = await tokenSaleContract.read.paymentToken();
      const paymentToken = await viem.getContractAt("IERC20", paymentTokenAddress);
      await expect(paymentToken.read.totalSupply()).to.be.not.rejected;
      // totalSupply is readable meaning that it is ERC20 token
    });    

// Test 4
    it("uses a valid ERC721 as NFT collection", async () => {
      const { tokenSaleContract, myTokenContract } = await loadFixture(fixture);
      const nftCollectionAddress = await tokenSaleContract.read.nftCollection();
      const nftToken = await viem.getContractAt("IERC721", nftCollectionAddress);     
      await expect(nftToken.read.balanceOf([nftCollectionAddress])).to.be.not.rejected;
      // balanceOf nftCollectionAddress is readable meaning that it is ERC721 token
    });
  })
  describe("When a user buys an ERC20 from the Token contract", async () => {  

// Test 5
    it("charges the correct amount of ETH", async () => {
      const { tokenSaleContract, publicClient, deployer, acc1 } = await loadFixture(fixture);
      const ethBalanceBefore = await publicClient.getBalance({address: acc1.account.address,});
      console.log(formatEther(ethBalanceBefore));
      const tx = await tokenSaleContract.write.buyTokens({ value: parseEther(TEST_BUY_AMOUNT), account: acc1.account}); // account 1 is buying
      const txReceipt = await publicClient.getTransactionReceipt({hash: tx});
      const gasAmount = txReceipt.gasUsed;
      const gasPrice = txReceipt.effectiveGasPrice;
      const txFees = gasAmount * gasPrice;
      const ethBalanceAfter = await publicClient.getBalance({address: acc1.account.address,});
      console.log(formatEther(ethBalanceAfter));
      const diff = ethBalanceBefore - ethBalanceAfter;
      // console.log(formatEther(diff));
      // console.log(formatEther(parseEther(TEST_BUY_AMOUNT)));
      expect(diff).to.be.eq(parseEther(TEST_BUY_AMOUNT) + txFees);
    })

// Test 6
    it("gives the correct amount of tokens", async () => {
      const { tokenSaleContract, myTokenContract, deployer, acc1 } = await loadFixture(fixture);
      const tokenBalanceBefore = await myTokenContract.read.balanceOf([acc1.account.address]); // deployer has minted tokens via constructor
      console.log(tokenBalanceBefore);
      const tx = await tokenSaleContract.write.buyTokens({ value: parseEther(TEST_BUY_AMOUNT), account: acc1.account});
      const tokenBalanceAfter = await myTokenContract.read.balanceOf([acc1.account.address]);
      console.log(tokenBalanceAfter);
      const diff  = tokenBalanceAfter - tokenBalanceBefore;
      // console.log(diff);
      expect(diff).to.be.eq(parseEther(TEST_BUY_AMOUNT) * TEST_RATIO);
    });
  })
  describe("When a user burns an ERC20 at the Shop contract", async () => {

// Test 7
    it("gives the correct amount of ETH", async () => {
      // initialization
      const { tokenSaleContract, myTokenContract, publicClient, deployer, acc1 } = await loadFixture(fixture);
      const ethBalAcc1Init = await publicClient.getBalance({address: acc1.account.address,});
      
      // acc1 buys tokens, and decrements eth
      const txBuy = await tokenSaleContract.write.buyTokens({ value: parseEther(TEST_BUY_AMOUNT), account: acc1.account});
      const ethBalAcc1Buy = await publicClient.getBalance({address: acc1.account.address},);
      console.log('ethBalBuy is', formatEther(ethBalAcc1Buy));
      const ethBalConBuy = await publicClient.getBalance({address: tokenSaleContract.address},);
      console.log("tokCon: ",myTokenContract.address, "tokSale: ",tokenSaleContract.address, "acc1: ", acc1.account.address, "dep: ", deployer.account.address);

      // acc1 burns tokens and receives eth
      const txAppr = await myTokenContract.write.approve([tokenSaleContract.address, parseEther(TEST_SELL_AMOUNT)],{account: acc1.account});
      const tt = await myTokenContract.read.allowance([tokenSaleContract.address, acc1.account.address]);
      console.log("Allowance for spender myTokenContract for owner tokenSaleContract is:", formatEther(tt));
      
      console.log(formatEther(parseEther(TEST_SELL_AMOUNT)));
      const txSell = await tokenSaleContract.write.returnTokens([parseEther(TEST_SELL_AMOUNT)],{account: acc1.account});
      // const txTransfer = await myTokenContract.write.transferFrom([tokenSaleContract.address, acc1.account.address, 3n],{account: acc1.account});
      // const ethBalBurnAcc1 =  await publicClient.getBalance({address: acc1.account.address,});
      // const ethBalBurnCon =  await publicClient.getBalance({address: tokenSaleContract.address,});
      
      // console.log("For acc1, ethBalInitial: ", formatEther(ethBalInit), " ethBalAfterBuy: ",formatEther(ethBalBuy), " ethBalAfterBurn: ", formatEther(ethBalBurnAcc1));
      // console.log("For contract, ethBalInitial: ", formatEther(ethBalCon), " ethBalAfterBurn: ",formatEther(ethBalBurnCon));
      //const tokenBalanceReturn = await publicClient.getBalance({address: acc1.account.address},);
      // console.log(formatEther(tokenBalanceReturn)); 
      // const diff = tokenBalanceReturn - tokenBalanceBuyTokens;
      // console.log(formatEther(diff));
      // console.log(formatEther(parseEther(TEST_SELL_AMOUNT)));
      // expect(diff).to.be.eq(parseEther(TEST_SELL_AMOUNT));
    })
// Test 8 
    it("burns the correct amount of tokens", async () => {
      const { tokenSaleContract, myTokenContract, deployer, acc1 } = await loadFixture(fixture);
      const txBuy = await tokenSaleContract.write.buyTokens({ value: parseEther(TEST_BUY_AMOUNT), account: acc1.account});
      const tokenBalanceBefore = await myTokenContract.read.balanceOf([acc1.account.address]); // deployer has minted tokens via constructor
      const tx = await tokenSaleContract.write.returnTokens({ value: parseEther(TEST_SELL_AMOUNT), account: acc1.account}); // account 1 buys 10 tokens
      const tokenBalanceAfter = await myTokenContract.read.balanceOf([acc1.account.address]);
      const diff  = (tokenBalanceBefore - tokenBalanceAfter) * TEST_RATIO;
      // console.log(diff);
      console.group(parseEther(TEST_SELL_AMOUNT) * TEST_RATIO);
      expect(diff).to.be.eq(parseEther(TEST_SELL_AMOUNT) * TEST_RATIO);
    });
  })
  describe("When a user buys an NFT from the Shop contract", async () => {
// Test 9
    it("charges the correct amount of ERC20 tokens", async () => {
      const { tokenSaleContract, myTokenContract, publicClient, deployer, acc1 } = await loadFixture(fixture);
      const ethBalanceBefore = await publicClient.getBalance({address: acc1.account.address,});
      console.log(ethBalanceBefore);
      const tx = await tokenSaleContract.write.buyNFTs([TEST_TOKEN_ID], {value: parseEther(TEST_BUY_AMOUNT), account: acc1.account,}); // account 1 is buying
      const txReceipt = await publicClient.getTransactionReceipt({hash: tx});
      const gasAmount = txReceipt.gasUsed;
      const gasPrice = txReceipt.effectiveGasPrice;
      const txFees = gasAmount * gasPrice;
      console.log(txFees);
      const ethBalanceAfter = await publicClient.getBalance({address: acc1.account.address,});
      // not spending any money, need to fix this
      const diff = ethBalanceBefore - ethBalanceAfter;
      console.log(diff);
      expect(diff).to.be.eq(parseEther(TEST_BUY_AMOUNT) + txFees);
      // console.log(diff);
      expect(diff).to.be.eq(parseEther(TEST_BUY_AMOUNT) + txFees);
    })
// Test 10
    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user burns their NFT at the Shop contract", async () => {
// Test 11
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When the owner withdraws from the Shop contract", async () => {
// Test 12
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
// Test 13
    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});