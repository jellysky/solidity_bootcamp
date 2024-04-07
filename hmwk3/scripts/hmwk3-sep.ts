import { createPublicClient, http, createWalletClient, parseEther, formatEther, toHex, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import myToken from "../artifacts/contracts/MyToken.sol/MyToken.json";
import tokenizedBallot from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json"; // does this mean it needs to move to another page
dotenv.config();

const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const providerApiKey = process.env.ALCHEMY_API_KEY || "";

const MINT_VALUE = parseEther("100");
// const PROPOSALS = ["Vanilla", "Chocolate", "Strawberry"];
// TODO change toString to formatEther

async function main() {

    // console.log(abi);
    //console.log(bytecode2);
  
    // // Contract addresses
    const peterAddress = "0xe0A28485ce1b81df501e97c9370C9dc69B97432D";
    const noriAddress = "0xb5CfEDa2c8B64E0Da441337E0Dc8A2Dbcab4d727";  // must replace, is actually victor's address
    const nicoAddress = "0x14dd882a81e6BA027F1fAC4085ae481e2EdAE450";
    
    // // Initialization
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const publicClient = await createPublicClient({chain: sepolia, transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),});
    const deployer = createWalletClient({account, chain: sepolia, transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),});
    console.log("Deployer address:", deployer.account.address);
    const balance = await publicClient.getBalance({address: deployer.account.address,});
    console.log("Deployer balance:",formatEther(balance),deployer.chain.nativeCurrency.symbol);

    // MyToken deployment
    console.log("\nDeploying MyToken contract");
    const hash = await deployer.deployContract({abi: myToken.abi, bytecode: myToken.bytecode as `0x${string}`,}); // don't include args if empty
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash: hash });
    const tokenContractAddress = receipt.contractAddress;
    console.log("Token contract deployed to:", tokenContractAddress);
    
    // // Mint tokens to deployer
    const mintTx = await deployer.writeContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'mint', args: [peterAddress, MINT_VALUE],});
    await publicClient.waitForTransactionReceipt({ hash: mintTx });
    console.log("Transaction hash: ", mintTx);
    const balancePeter = await publicClient.readContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'balanceOf', args: [peterAddress],});
    console.log(`Account peter ${peterAddress} has ${formatEther(balancePeter)} units of MyToken\n`);

    // Tx1 give 20 units of token to nico
    const trTxNico = await deployer.writeContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'transfer', args: [nicoAddress, parseEther("20")],});
    await publicClient.waitForTransactionReceipt({ hash: trTxNico });
    const balanceNico = await publicClient.readContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'balanceOf', args: [nicoAddress],});
    console.log(`Tx1: Account nico ${nicoAddress} has ${formatEther(balanceNico)} units of MyToken after TX\n`);
    const balancePeter2 = await publicClient.readContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'balanceOf', args: [peterAddress],});
    console.log(`Tx1: Account peter ${peterAddress} has ${formatEther(balancePeter2)} units of MyToken after TX\n`);

    // Tx2 give 30 units of token to nori
    const trTxNori = await deployer.writeContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'transfer', args: [noriAddress, parseEther("30")],});
    await publicClient.waitForTransactionReceipt({ hash: trTxNori });
    const balanceNori = await publicClient.readContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'balanceOf', args: [noriAddress],});
    console.log(`Tx2: Account nori ${noriAddress} has ${formatEther(balanceNori)} units of MyToken after TX\n`);
    const balancePeter3 = await publicClient.readContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'balanceOf', args: [peterAddress],});
    console.log(`Tx2: Account peter ${peterAddress} has ${formatEther(balancePeter3)} units of MyToken after TX\n`);

    // Delegate voting power from deployer to peter - (peter is deployer)
    const delgTxPeter = await deployer.writeContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'delegate', args: [peterAddress],});
    await publicClient.waitForTransactionReceipt({ hash: delgTxPeter });
    const votesPeter = await publicClient.readContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'getVotes', args: [peterAddress],});
    console.log(`Account peter ${peterAddress} has ${formatEther(votesPeter)} units of voting power after delegating\n`);
    
    // const delgTxNico = await deployer.writeContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'transfer', args: [nicoAddress],});
    // await publicClient.waitForTransactionReceipt({ hash: delgTxNico });
    // const votesNico = await publicClient.readContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'getVotes', args: [nicoAddress],});
    // console.log(`Account nico ${nicoAddress} has ${formatEther(votesNico)} units of voting power after delegating\n`);

    // const delgTxNori = await deployer.writeContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'transfer', args: [noriAddress],});
    // await publicClient.waitForTransactionReceipt({ hash: delgTxNori });
    // const votesNori = await publicClient.readContract({address: tokenContractAddress, abi: myToken.abi, functionName: 'getVotes', args: [noriAddress],});
    // console.log(`Account nori ${noriAddress} has ${formatEther(votesNori)} units of voting power after delegating\n`);


    // Initialization
    // console.log("Deployer address:", deployer.account.address);
    // const balance2 = await publicClient.getBalance({address: deployer.account.address,});
    // console.log("Deployer balance:",formatEther(balance2), deployer.chain.nativeCurrency.symbol);

    // Deploying the second contract

    const blockNumber = await publicClient.getBlockNumber();
    console.log("Blocknumber is: ", blockNumber);
    console.log("tokenContractAddress is: ", tokenContractAddress);
    const PROPOSALS = ["Vanilla", "Chocolate", "Strawberry"];
    // const publicClient2 = await createPublicClient({chain: sepolia, transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),});

    console.log("\nDeploying Tokenized Ballot contract");
    const hash2 = await deployer.deployContract({abi: tokenizedBallot.abi, bytecode: tokenizedBallot.bytecode as `0x${string}`, args: [PROPOSALS.map((prop) => toHex(prop, { size: 32 })), receipt.contractAddress, blockNumber,]}); // don't include args if empty
    console.log("Transaction hash2:", hash2);
    console.log("Waiting for confirmations...");
    // for (let index = 0; index < PROPOSALS.length; index++) {
    //     const proposal = await publicClient.readContract({address: ballotContractAddress, abi: abi2, functionName: 'proposals', args: [BigInt(index)],});
    //     const name = hexToString(proposal[0], { size: 32 });
    //     console.log("Proposals -> ", { index, name, proposal });
    // }

    const receipt2 = await publicClient.waitForTransactionReceipt({ hash: hash2 }); // something is wrong here
    // console.log(receipt2);
    const ballotContractAddress = receipt2.contractAddress;
    console.log("Ballot contract deployed to:", ballotContractAddress);

    // // Cast votes
    const voteTxPeter = await deployer.writeContract({address: ballotContractAddress, abi: tokenizedBallot.abi, functionName: 'vote', args: [BigInt(0), parseEther("1")],});
    const hash3 = await publicClient.waitForTransactionReceipt({ hash: voteTxPeter });
    console.log("Peter voted ");

    // const voteTxNico = await deployer.writeContract({address: ballotContractAddress, abi: abi2, functionName: 'vote', args: [BigInt(1), parseEther("15")],});
    // await publicClient.waitForTransactionReceipt({ hash: voteTxNico });

    // const voteTxNori = await deployer.writeContract({address: ballotContractAddress, abi: abi2, functionName: 'vote', args: [BigInt(1), parseEther("19")],});
    // await publicClient.waitForTransactionReceipt({ hash: voteTxNori });

    // // Query results
    const winnerName = await publicClient.readContract({ address: ballotContractAddress, abi: tokenizedBallot.abi, functionName: 'winnerName', args: [],});
    const blockNumber2 = await publicClient.getBlockNumber();
    const pastVotes = await publicClient.readContract({ address: tokenContractAddress, abi: myToken.abi, functionName: 'getPastVotes', args: [peterAddress, blockNumber2 - 1n],});
    console.log("Past votes of peter: ", pastVotes)
    console.log("The winning proposal is: " + hexToString(winnerName, { size: 32 }))

}


main().catch(err => {
  console.log(err)
  process.exitCode = 1
})