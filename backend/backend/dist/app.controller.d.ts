import { AppService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';
import { TransferTokenDto } from './dtos/transferToken.dto';
import { DelegateDto } from './dtos/delegate.dto';
import { VoteDto } from './dtos/vote.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getContractAddress(): {
        result: string;
    };
    getContractAddressBallot(): {
        result: string;
    };
    getTokenName(): Promise<{
        result: string;
    }>;
    getTotalSupply(): Promise<{
        result: string;
    }>;
    getTokenBalance(address: string): Promise<{
        result: string;
    }>;
    getTransactionReceipt(hash: string): Promise<{
        result: any;
    }>;
    getServerWalletAddress(): {
        result: Promise<any>;
    };
    checkMinterRole(address: string): Promise<{
        result: void;
    }>;
    mintTokens(body: MintTokenDto): Promise<{
        result: string;
    }>;
    transferTokens(body: TransferTokenDto): Promise<{
        result: string;
    }>;
    delegate(body: DelegateDto): Promise<{
        result: string;
    }>;
    getVotes(address: string): Promise<{
        result: string;
    }>;
    vote(body: VoteDto): Promise<{
        result: string;
    }>;
}
