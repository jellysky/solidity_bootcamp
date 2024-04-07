import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
dotenv.config();

const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const providerApiKey = process.env.ALCHEMY_API_KEY || "";


async function main() {

    // we first deployed the contract using the DeployWithViem.ts code
    // these are the contract and user addresses, myAddress is chairperson
    const contractAddress = "0x44581EbCd64c7Fe1F2c5a95DCbcDdb90D0903114";
    const myAddress = "0xe0A28485ce1b81df501e97c9370C9dc69B97432D";
    const victorAddress = "0xb5CfEDa2c8B64E0Da441337E0Dc8A2Dbcab4d727";
    const nicoAddress = "0x14dd882a81e6BA027F1fAC4085ae481e2EdAE450";

    // these are the objects we need to interact with the contract
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const publicClient = await createPublicClient({chain: sepolia, transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),});
    const deployer = createWalletClient({account, chain: sepolia, transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),});
        
    // here we log the struct values for the chairperson
    const preVoters = await publicClient.readContract({address: contractAddress, abi: abi, functionName: 'voters', args: [myAddress],});
    console.log(preVoters);

    // here the chairperson gave Victor the right to vote and we log Victor's struct values after he receives that right
    const giveRightToVote = await deployer.writeContract({address: contractAddress, abi: abi, functionName: 'giveRightToVote', args: [nicoAddress],});
    await publicClient.waitForTransactionReceipt({ hash: giveRightToVote });
    const postVoters = await publicClient.readContract({address: contractAddress, abi: abi, functionName: 'voters', args: [victorAddress],});
    console.log(postVoters);

    // here the chairperson delegates his vote to Nico and we log the delegate's address in the chairperson's struct
    const delegate = await deployer.writeContract({address: contractAddress, abi: abi, functionName: 'delegate', args: [nicoAddress],});
    await publicClient.waitForTransactionReceipt({ hash: delegate });
    const delegateVoters = await publicClient.readContract({address: contractAddress, abi: abi, functionName: 'voters', args: [myAddress],});
    console.log(delegateVoters);

    // here the chairperson tried to vote, but it returned an error because he had delegated the vote
    const vote = await deployer.writeContract({address: contractAddress, abi: abi, functionName: 'vote', args: [myAddress],});
    await publicClient.waitForTransactionReceipt({ hash: vote });

    // here we call and log the winner
    const winner = await publicClient.readContract({address: contractAddress, abi: abi, functionName: 'winnerName',});
    // await publicClient.waitForTransactionReceipt({ hash: winnerName });
    // const winner = await deployer.writeContract({address: contractAddress, abi: abi, functionName: 'winnerName',});
    console.log(winner);

  };
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  