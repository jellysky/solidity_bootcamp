import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { toHex, hexToString } from "viem";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function deployContract() {
  const publicClient = await hre.viem.getPublicClient();
  const [deployer, otherAccount] = await hre.viem.getWalletClients();
  const ballotContract = await hre.viem.deployContract("Ballot", [PROPOSALS.map((prop) => toHex(prop, { size: 32 })), ]);
  return { publicClient, deployer, otherAccount, ballotContract };
}

// Test 1  
describe("Ballot", async () => {
  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        expect(hexToString(proposal[0], { size: 32 })).to.eq(PROPOSALS[index]);
      }
    });

// Test 2  
    it("has zero votes for all proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        expect(proposal[1]).to.eq(0n);
      }
    });

// Test 3
    it("sets the deployer address as chairperson", async () => {
      const { ballotContract, deployer } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      expect(chairperson.toLowerCase()).to.eq(deployer.account.address);
    });

// Test 4
    it("sets the voting weight for the chairperson as 1", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      const chairpersonVoter = await ballotContract.read.voters([chairperson]);
      expect(chairpersonVoter[0]).to.eq(1n);
      // chairpersonVoter weight should be 1
    });
  });

// Test 5
  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("gives right to vote for another address", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      // check to see if value is zero before calling giveRightToVote
      await ballotContract.write.giveRightToVote([otherAccount.account.address]);
      const otherAccountVoter = await ballotContract.read.voters([otherAccount.account.address]);
      expect(otherAccountVoter[0]).to.eq(1n);
      // expect otherAccount's weight to be one because it was added properly
    });

// Test 6
    it("can not give right to vote for someone that has voted", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      await ballotContract.write.giveRightToVote([otherAccount.account.address]);
      const ballotContractAsOtherAccount = await hre.viem.getContractAt("Ballot", ballotContract.address,{ client: { wallet: otherAccount }}); // moves to otherAccount's perspective
      await ballotContractAsOtherAccount.write.vote([BigInt(0)]); // otherAccount votes
      await expect(ballotContract.write.giveRightToVote([otherAccount.account.address])).to.be.rejectedWith("The voter already voted.");
      // Voter tries to vote after voting and the contract should throw the right error string
      })
    });

// Test 7
    it("can not give right to vote for someone that has already voting rights", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      const otherAccountVoter = await ballotContract.read.voters([otherAccount.account.address]);
      expect(otherAccountVoter[0]).to.eq(0n);
      // expect otherAccount's weight to be zero because it was not added already into the voters mapping - DOES THIS WORK????
    });
  });

// Test 8
  describe("when the voter interacts with the vote function in the contract", async () => {
  
    it("should register the vote", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      const index = 0;
      const initialProposalVote = await ballotContract.read.proposals([BigInt(index)]);
      await ballotContract.write.giveRightToVote([otherAccount.account.address]);
      await ballotContract.write.vote([BigInt(index)]);
      const finalProposalVote = await ballotContract.read.proposals([BigInt(index)]);
      expect(finalProposalVote[1] - initialProposalVote[1]).to.be.eq(1n);
      // expect difference between finalProposalVote and initialProposalVote to be 1 after the otherAccount votes
    });
  });

// Test 9
  describe("when the voter interacts with the delegate function in the contract", async () => {
    
    it("should transfer voting power", async () => {
      const { deployer, otherAccount, ballotContract } = await loadFixture(deployContract);
      await ballotContract.write.giveRightToVote([otherAccount.account.address]);
      const ballotContractAsOtherAccount = await hre.viem.getContractAt("Ballot", ballotContract.address,{ client: { wallet: otherAccount }});
      await ballotContractAsOtherAccount.write.delegate([deployer.account.address]);
      const otherAccountVoter = await ballotContract.read.voters([otherAccount.account.address]);
      expect(otherAccountVoter[2].toLowerCase()).to.eq(deployer.account.address);
      // Expect otherAccount's delegate to be deployer
    });
  });


// Test 10
  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("should revert", async () => {
      const { deployer, otherAccount, ballotContract } = await loadFixture(deployContract);
      const ballotContractAsOtherAccount = await hre.viem.getContractAt("Ballot", ballotContract.address,{ client: { wallet: otherAccount }});
      await expect(ballotContractAsOtherAccount.write.giveRightToVote([deployer.account.address])).to.be.rejectedWith("Only chairperson can give right to vote.");
      // Expect otherAccount's giveRightToVote call to be rejected with correct error message
    });
  });
  
// Test 11
  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    
    it("should revert", async () => {
      const index = 1;
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      const ballotContractAsOtherAccount = await hre.viem.getContractAt("Ballot", ballotContract.address,{ client: { wallet: otherAccount }});
      await expect(ballotContractAsOtherAccount.write.vote([BigInt(index)])).to.be.rejectedWith("Has no right to vote");
      // Expect otherAccount's call to vote to be rejected with the correct error message
    });
  });

// Test 12
  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    it("should revert", async () => {
      const { deployer, otherAccount, ballotContract } = await loadFixture(deployContract);
      const ballotContractAsOtherAccount = await hre.viem.getContractAt("Ballot", ballotContract.address,{ client: { wallet: otherAccount }});
      await expect(ballotContractAsOtherAccount.write.delegate([deployer.account.address])).to.be.rejectedWith("You have no right to vote");
      // otherAccount should get right error string when he tries to vote without right to vote
    });
  });

// Test 13
  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    it("should return 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const winningProposal = await ballotContract.read.winningProposal();
      expect(winningProposal).to.eq(0n);
      // check to see that winningProposal equals 0 after no votes - WHY DO I NEED TO SAVE IT AS A VARIABLE INSTEAD OF CALLING IT DIRECTLY??
    });
  });

// Test 14
  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    it("should return 0", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      await ballotContract.write.giveRightToVote([otherAccount.account.address]);
      const ballotContractAsOtherAccount = await hre.viem.getContractAt("Ballot", ballotContract.address,{ client: { wallet: otherAccount }});
      await ballotContractAsOtherAccount.write.vote([BigInt(0)]);
      const winningProposal = await ballotContract.read.winningProposal();
      expect(winningProposal).to.eq(0n);
      // check to see that winningProposal equals 0 after 1 vote - WHY DO I NEED TO SAVE IT AS A VARIABLE INSTEAD OF CALLING IT DIRECTLY??

    });
  });

// Test 15
  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    it("should return name of proposal 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const winnerName = await ballotContract.read.winnerName();
      // console.log(hexToString(winnerName, { size: 32 }));
      expect(hexToString(winnerName, { size: 32 })).to.eq(PROPOSALS[0]);
      // check to see that winnerName equals 0 after no votes - WHY DO I NEED TO SAVE IT AS A VARIABLE INSTEAD OF CALLING IT DIRECTLY??
    });
  });


// Test 16
  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    it("should return name of proposal 0", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      await ballotContract.write.giveRightToVote([otherAccount.account.address]); // gives otherAccount right to vote
      const ballotContractAsOtherAccount = await hre.viem.getContractAt("Ballot", ballotContract.address,{ client: { wallet: otherAccount }}); // moves to otherAccount's perspective
      await ballotContractAsOtherAccount.write.vote([BigInt(0)]); // otherAccount votes
      const winnerName = await ballotContract.read.winnerName();
      expect(hexToString(winnerName, { size: 32 })).to.eq(PROPOSALS[0]);
      // check to see that winnerName equals 0 after 1 vote - WHY DO I NEED TO SAVE IT AS A VARIABLE INSTEAD OF CALLING IT DIRECTLY??
    });
  });


// Test 17
  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    it("should return the name of the winner proposal", async () => {
      const { publicClient, deployer, otherAccount, ballotContract } = await loadFixture(deployContract);
      const accounts = await hre.viem.getWalletClients();
      
      for (const account of accounts) {
        const index = account.account.address % (PROPOSALS.length); // where I assign random proposal number
        if (deployer.account.address != account.account.address) {
          await ballotContract.write.giveRightToVote([account.account.address]);
          const ballotContractAsOtherAccount = await hre.viem.getContractAt("Ballot", ballotContract.address,{ client: { wallet: account }}); 
          // moves to otherAccount's perspective // gives otherAccount right to vote
          await ballotContractAsOtherAccount.write.vote([BigInt(index)]); // otherAccount votes
          console.log("Account: ", account.account.address, "added and voted for Proposal ", index);  
        } else {
          console.log("Account: ", account.account.address, "same as chairperson and not added ... ");  
        }
      }
      const winningProposal = await ballotContract.read.winningProposal();
      const winnerName = await ballotContract.read.winnerName();
      console.log("Winning proposal is :", PROPOSALS[winningProposal]);
      expect(hexToString(winnerName, { size: 32 })).to.eq(PROPOSALS[winningProposal]);
      // have a string of account vote randomly and then check to see that winningProposal corresponds with winnerName
      });
    });