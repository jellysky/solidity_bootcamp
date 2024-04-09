import { ConfigService } from '@nestjs/config';
export declare class AppService {
    private configService;
    publicClient: any;
    walletClient: any;
    constructor(configService: ConfigService);
    getHello(): string;
    getOtherThing(): string;
    getContractAddress(): string;
    getContractAddressBallot(): string;
    getTokenName(): Promise<string>;
    getTotalSupply(): Promise<string>;
    getTokenBalance(address: string): Promise<string>;
    getTransactionReceipt(hash: string): Promise<any>;
    getServerWalletAddress(): Promise<any>;
    checkMinterRole(address: string): void;
    mintTokens(address: string): Promise<string>;
    transferTokens(from: string, to: string, amount: string): Promise<string>;
    delegate(address: string): Promise<string>;
    getVotes(address: string): Promise<string>;
    vote(proposal: number, amount: string): Promise<string>;
}
