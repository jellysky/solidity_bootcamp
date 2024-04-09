"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const viem_1 = require("viem");
const chains = require("viem/chains");
const accounts_1 = require("viem/accounts");
const tokenJson = require("./assets/MyToken.json");
const ballotJson = require("./assets/TokenizedBallot.json");
const config_1 = require("@nestjs/config");
const MINT_VALUE = (0, viem_1.parseEther)("100");
let AppService = class AppService {
    constructor(configService) {
        this.configService = configService;
        const account = (0, accounts_1.privateKeyToAccount)(`0x${process.env.PRIVATE_KEY}`);
        this.publicClient = (0, viem_1.createPublicClient)({ chain: chains.sepolia, transport: (0, viem_1.http)(this.configService.get('RPC_ENDPOINT_URL')), });
        this.walletClient = (0, viem_1.createWalletClient)({ account: account, chain: chains.sepolia, transport: (0, viem_1.http)(this.configService.get('RPC_ENDPOINT_URL')), key: this.configService.get('PRIVATE_KEY') });
    }
    getHello() {
        return 'Hello World!';
    }
    getOtherThing() {
        return 'Other Thing!';
    }
    getContractAddress() {
        return this.configService.get('TOKEN_ADDRESS');
    }
    getContractAddressBallot() {
        return this.configService.get('BALLOT_ADDRESS');
    }
    async getTokenName() {
        const name = await this.publicClient.readContract({ address: this.getContractAddress(), abi: tokenJson.abi, functionName: "name" });
        return name;
    }
    async getTotalSupply() {
        const totalSupply = await this.publicClient.readContract({ address: this.getContractAddress(), abi: tokenJson.abi, functionName: "totalSupply" });
        return (0, viem_1.formatEther)(totalSupply);
    }
    async getTokenBalance(address) {
        const tokenBalance = await this.publicClient.readContract({ address: this.getContractAddress(), abi: tokenJson.abi, functionName: "balanceOf", args: [address], });
        return (0, viem_1.formatEther)(tokenBalance);
    }
    async getTransactionReceipt(hash) {
        const transactionReceipt = await this.publicClient.getTransactionReceipt({ hash });
        transactionReceipt.blockNumber = transactionReceipt.blockNumber.toString();
        transactionReceipt.gasUsed = transactionReceipt.gasUsed.toString();
        transactionReceipt.cumulativeGasUsed = transactionReceipt.cumulativeGasUsed.toString();
        transactionReceipt.effectiveGasPrice = transactionReceipt.effectiveGasPrice.toString();
        console.log({ transactionReceipt });
        return transactionReceipt;
    }
    async getServerWalletAddress() {
        const address = await this.walletClient.address;
        console.log(address);
        return address;
    }
    checkMinterRole(address) {
        throw new Error('Method not implemented.');
    }
    async mintTokens(address) {
        const txHash = await this.walletClient.writeContract({ address: this.getContractAddress(), abi: tokenJson.abi, functionName: 'mint', args: [address, MINT_VALUE], });
        const tokenBalance = await this.getTokenBalance(address);
        return `Minting tokens to ${address} + Token balance is ${tokenBalance} ... `;
    }
    async transferTokens(from, to, amount) {
        const txHash = await this.walletClient.writeContract({ address: this.getContractAddress(), abi: tokenJson.abi, functionName: 'transfer', args: [to, (0, viem_1.parseEther)(amount)], });
        const balanceTo = await this.getTokenBalance(to);
        const balanceFrom = await this.getTokenBalance(from);
        return `Transferred ${amount} tokens from: ${from} to: ${to} ... `;
    }
    async delegate(address) {
        const txHash = await this.walletClient.writeContract({ address: this.getContractAddress(), abi: tokenJson.abi, functionName: 'delegate', args: [address], });
        return `Delegated to account: ${address} ... `;
    }
    async getVotes(address) {
        const votes = await this.publicClient.readContract({ address: this.getContractAddress(), abi: tokenJson.abi, functionName: "getVotes", args: [address], });
        return `Account: ${address} has ${(0, viem_1.formatEther)(votes)} units of voting power after delegation\n`;
    }
    async vote(proposal, amount) {
        const txHash = await this.walletClient.writeContract({ address: this.getContractAddressBallot(), abi: ballotJson.abi, functionName: 'vote', args: [BigInt(proposal), (0, viem_1.parseEther)(amount)], });
        return `Account voted for proposal: ${proposal} in the amount: ${amount} ... `;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map