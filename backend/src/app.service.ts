import { Injectable } from '@nestjs/common';
import { createPublicClient, createWalletClient, http, formatEther, parseEther, toHex, hexToString } from 'viem';
import * as chains from 'viem/chains';
import { privateKeyToAccount } from "viem/accounts";
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/TokenizedBallot.json';
import { ConfigService } from '@nestjs/config';

//const deployerPrivateKey = process.env.PRIVATE_KEY || "";
// const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const MINT_VALUE = parseEther("100");

@Injectable()
export class AppService {
  publicClient;
  walletClient;

  constructor(private configService: ConfigService) {
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    this.publicClient = createPublicClient({chain: chains.sepolia, transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),});
    this.walletClient = createWalletClient({account: account, chain: chains.sepolia, transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')), key: this.configService.get<string>('PRIVATE_KEY') });
    
    // this.publicClient = createPublicClient({chain: chains.sepolia, transport: http(process.env.RPC_ENDPOINT_URL),});
    // this.walletClient = createWalletClient({account: account, chain: chains.sepolia, transport: http(process.env.RPC_ENDPOINT_URL),});
  }
  
  getHello(): string {
    return 'Hello World!';
  }

  getOtherThing(): string { 
    return 'Other Thing!';
  }

  getContractAddress(): string {
    return this.configService.get<string>('TOKEN_ADDRESS');
  }

  getContractAddressBallot(): string {
    return this.configService.get<string>('BALLOT_ADDRESS');
  }

  async getTokenName(): Promise<string> {
    const name = await this.publicClient.readContract({address: this.getContractAddress(), abi: tokenJson.abi, functionName: "name"});
    // const name = process.env.TOKEN_ADDRESS;
    return name;
  }

  async getTotalSupply() {

    const totalSupply = await this.publicClient.readContract({address: this.getContractAddress() as `0x${string}`, abi: tokenJson.abi, functionName: "totalSupply"});
    return formatEther(totalSupply as bigint);
  }
  
  async getTokenBalance(address: string) {
    
    const tokenBalance = await this.publicClient.readContract({address: this.getContractAddress() as `0x${string}`, abi: tokenJson.abi, functionName: "balanceOf", args: [address], });
    return formatEther(tokenBalance as bigint);
  }

  async getTransactionReceipt(hash: string) {

    const transactionReceipt = await this.publicClient.getTransactionReceipt({hash});
    transactionReceipt.blockNumber = transactionReceipt.blockNumber.toString();
    transactionReceipt.gasUsed = transactionReceipt.gasUsed.toString();
    transactionReceipt.cumulativeGasUsed = transactionReceipt.cumulativeGasUsed.toString();
    transactionReceipt.effectiveGasPrice = transactionReceipt.effectiveGasPrice.toString();
    console.log({transactionReceipt});
    return transactionReceipt;
  }
  
  async getServerWalletAddress() {
    
    const address = await this.walletClient.address;
    console.log(address);
    
    return address;
  }

  checkMinterRole(address: string) {
    throw new Error('Method not implemented.');
  }

  async mintTokens(address: string) {
    
    const txHash = await this.walletClient.writeContract({address: this.getContractAddress() as `0x${string}`, abi: tokenJson.abi, functionName: 'mint', args: [address, MINT_VALUE],});
    // const transactionReceipt = await this.publicClient.getTransactionReceipt({txHash}); it doesnt like this for some reason
    // console.log({transactionReceipt});
    const tokenBalance = await this.getTokenBalance(address);
    
    return `Minting tokens to ${address} + Token balance is ${tokenBalance} ... `;
  }

  async transferTokens(from: string, to: string, amount: string) {

    const txHash = await this.walletClient.writeContract({address: this.getContractAddress() as `0x${string}`, abi: tokenJson.abi, functionName: 'transfer', args: [to, parseEther(amount)],});
    const balanceTo = await this.getTokenBalance(to);
    const balanceFrom = await this.getTokenBalance(from);
    
    return `Transferred ${amount} tokens from: ${from} to: ${to} ... `;
  }

  async delegate(address: string) { 

    const txHash = await this.walletClient.writeContract({address: this.getContractAddress() as `0x${string}`, abi: tokenJson.abi, functionName: 'delegate', args: [address],});
    return `Delegated to account: ${address} ... `;

  }
  async getVotes(address: string) {

    const votes = await this.publicClient.readContract({address: this.getContractAddress() as `0x${string}`, abi: tokenJson.abi, functionName: "getVotes", args: [address], });
    return `Account: ${address} has ${formatEther(votes)} units of voting power after delegation\n`;
  }

  async vote(proposal: number, amount: string) {

    const txHash = await this.walletClient.writeContract({address: this.getContractAddressBallot() as `0x${string}`, abi: ballotJson.abi, functionName: 'vote', args: [BigInt(proposal), parseEther(amount)],});
    // const account = await this.walletClient.address;
    return `Account voted for proposal: ${proposal} in the amount: ${amount} ... `

  }
}
