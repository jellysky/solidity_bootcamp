"use client";

import { useEffect, useState } from "react";
import Lottery from "../../hardhat/artifacts/contracts/Lottery.sol/Lottery.json";
import Token from "../../hardhat/artifacts/contracts/LotteryToken.sol/LotteryToken.json";
import { Provider, ethers } from "ethers";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import {
  UseWriteContractParameters,
  useAccount,
  useBalance,
  useBlockNumber,
  useChains,
  usePublicClient,
  useReadContract,
  useSignMessage,
  useSimulateContract,
  useToken,
  useWalletClient,
  useWriteContract,
} from "wagmi";

const lotteryAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
const tokenAddress = "0x524F04724632eED237cbA3c37272e018b3A7967e";
const peterAddress = "0x78B1BFe53c323D80FBa237607Dec0aB9619c602f";
const deployerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const TOKEN_RATIO = 1n;
const MAXUINT256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/pages/index.tsx
            </code>
          </p>
          <PageBody></PageBody>
        </div>
      </div>
    </>
  );
};

function PageBody() {
  return (
    <>
      <p className="text-center text-lg">Here we are!</p>
      <WalletInfo></WalletInfo>
    </>
  );
}

function WalletInfo() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { chain } = useChains();
  if (address)
    return (
      <div>
        <p>Your account address is: {address}</p>
        <p>Connected to the network: {chain?.name}</p>
        <WalletAction></WalletAction>
        <WalletBalance address={address as `0x${string}`}></WalletBalance>
        <TokenInfo address={address as `0x${string}`}></TokenInfo>
        <ApiDataOpen address={address as `0x${string}`}></ApiDataOpen>
        <ApiDataClose address={address as `0x${string}`}></ApiDataClose>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function WalletAction() {
  const [signatureMessage, setSignatureMessage] = useState("");
  const { data, isError, isSuccess, signMessage } = useSignMessage();
  return (
    <div className="card w-150 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing signatures</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label className="label">
            <span className="label-text">Enter the message to be signed:</span>
          </label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={signatureMessage}
            onChange={e => setSignatureMessage(e.target.value)}
          />
        </div>
        <button
          className="btn btn-active btn-neutral"
          onClick={() =>
            signMessage({
              message: signatureMessage,
            })
          }
        >
          Sign message
        </button>
        {isSuccess && <div>Signature: {data}</div>}
        {isError && <div>Error signing message</div>}
      </div>
    </div>
  );
}

function WalletBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({ address: params.address });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div className="card w-150 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useBalance wagmi hook</h2>
        Balance: {data?.formatted} {data?.symbol}
      </div>
    </div>
  );
}

function TokenName() {
  const { data, isError, isLoading } = useReadContract({
    address: tokenAddress,
    abi: [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "name",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token Name is: {name}</div>;
}

function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useReadContract({
    address: tokenAddress,
    abi: Token.abi,
    functionName: "balanceOf",
    args: [params.address],
  });
  // console.log(data);

  if (isLoading) return <div>Fetching balance ...</div>;
  if (isError) return <div>Error fetching balance ...</div>;
  return (
    <div>
      Token Balance is: {formatEther(data)} for address: {params.address}
    </div>
  );
}

function TotalSupply() {
  const { data, isError, isLoading } = useReadContract({
    address: tokenAddress,
    abi: [
      {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "totalSupply",
    account: tokenAddress,
  });

  console.log(data);

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return <div>Token Total Supply is: {formatEther(data)}</div>;
}

function GetBetsOpen() {
  const { data, isError, isLoading } = useReadContract({
    address: lotteryAddress,
    abi: [
      {
        constant: true,
        inputs: [],
        name: "betsOpen",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "betsOpen",
  });

  //console.log("Bets Open:", data);

  if (isLoading) return <div>Fetching owner…</div>;
  if (isError) return <div>Error fetching owner</div>;
  if (data)
    return (
      <div>
        <p>Lottery is OPEN</p>
      </div>
    );
  if (!data)
    return (
      <div>
        <p>Lottery is CLOSED</p>
      </div>
    );
  return data;
}

function TokenInfo(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useToken({ address: tokenAddress });

  return (
    <div className="card w-150 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useContractRead wagmi hook</h2>
        <TokenName></TokenName>
        <TokenBalance address={params.address}></TokenBalance>
        <TotalSupply></TotalSupply>
        <GetBetsOpen></GetBetsOpen>
        <GetPrizePool></GetPrizePool>
        <GetOwnerPool></GetOwnerPool>
        <GetClosingTime></GetClosingTime>
        <PrizeLimit></PrizeLimit>
      </div>
    </div>
  );
}

function OpenBets() {
  const deadline = 1813643753;
  const { writeContract } = useWriteContract();

  return (
    <button
      className="btn btn-active btn-neutral"
      onClick={() =>
        writeContract({
          abi: Lottery.abi,
          address: lotteryAddress,
          functionName: "openBets",
          args: [deadline],
          account: deployerAddress,
        })
      }
    >
      Open Lottery
    </button>
  );
}

function PurchaseTokens() {
  const [data, setData] = useState<{ result: boolean }>();
  const [isLoading, setLoading] = useState(false);
  const { writeContract } = useWriteContract();

  return (
    <button
      className="btn btn-active btn-neutral"
      onClick={() =>
        writeContract({
          abi: Lottery.abi,
          address: lotteryAddress,
          functionName: "purchaseTokens",
          value: parseEther("1") / TOKEN_RATIO,
        })
      }
    >
      Mint Tokens
    </button>
  );
}

function ApproveSpender() {
  const [data, setData] = useState<{ result: boolean }>();
  const [isLoading, setLoading] = useState(false);
  const { writeContract } = useWriteContract();

  return (
    <button
      className="btn btn-active btn-neutral"
      onClick={() =>
        writeContract({
          abi: Token.abi,
          address: tokenAddress,
          functionName: "approve",
          args: [lotteryAddress, MAXUINT256],
        })
      }
    >
      Approve Spender
    </button>
  );
}

function ReturnTokens() {
  const [data, setData] = useState<{ result: boolean }>();
  const [isLoading, setLoading] = useState(false);
  const { writeContract } = useWriteContract();

  return (
    <button
      className="btn btn-active btn-neutral"
      onClick={() =>
        writeContract({
          address: lotteryAddress,
          abi: Lottery.abi,
          functionName: "returnTokens",
          args: [parseEther("1") * TOKEN_RATIO],
        })
      }
    >
      Return Tokens
    </button>
  );
}

function Bet() {
  const [data, setData] = useState<{ result: boolean }>();
  const [isLoading, setLoading] = useState(false);
  const { writeContract } = useWriteContract();

  return (
    <button
      className="btn btn-active btn-neutral"
      onClick={() =>
        writeContract({
          address: lotteryAddress,
          abi: Lottery.abi,
          functionName: "betMany",
          args: [2],
          account: peterAddress,
        })
      }
    >
      Bet
    </button>
  );
}

function useBlock() {
  const publicClient = usePublicClient();
  const [block, setBlock] = useState<any>(null);

  useEffect(() => {
    async function fetchBlock() {
      try {
        const block = publicClient.getBlock();
        setBlock(block);
      } catch (error) {
        console.error("Error fetching block:", error);
      }
    }

    fetchBlock();
  }, [publicClient]);

  const { writeContract } = useWriteContract();
  const temp = writeContract({
    address: lotteryAddress,
    abi: Lottery.abi,
    functionName: "owner",
    args: [],
    account: deployerAddress,
  });
  console.log(temp);

  return block;
}

function GetDeadline() {
  const [timeStamp, setTimeStamp] = useState(0n);
  const dateNow = Date.now();
  const dateNowUTC = BigInt(Math.floor(dateNow / 1000) + 3600 * 4); // UTC 4 hours ahead to EST
  // console.log("date now = ", Date.now());
  // console.log("date now UTC = ", dateNowUTC);

  // Validate amount: Check if it's a non-empty, valid decimal number
  // const isValidAmount = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  // Function to handle input changes and convert string back to BigInt safely
  // const handleChange = e => {
  const value = 10000; //e.target.value;
  //try {
  // Convert the input string to a BigInt and store it
  setTimeStamp(BigInt(value));
  const deadline = dateNowUTC + 3600n + timeStamp;
  //console.log("Deadline is = ", deadline);
  //} catch {
  // If conversion fails, reset to an initial safe value like 0
  //  setTimeStamp(0n);
  //  }
  //};

  return deadline;
}

function GetClosingTime() {
  // how do you pull current block timestamp?

  const { data, isError, isLoading } = useReadContract({
    address: lotteryAddress,
    abi: Lottery.abi,
    functionName: "betsClosingTime",
  });
  const closingTimeDate = new Date(Number(data) * 1000);
  // console.log(closingTimeDate);

  if (data)
    return (
      <div>
        {/* <p>The last block was mined at ${currentBlockDate.toLocaleDateString()} : ${currentBlockDate.toLocaleTimeString()}</p> */}
        <p>
          The lottery should close at {closingTimeDate.toLocaleDateString()} : {closingTimeDate.toLocaleTimeString()}
        </p>
      </div>
    );
  if (isLoading)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isError)
    return (
      <div>
        <p>Something is wrong</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function GetOwnerPool() {
  const { data, isError, isLoading } = useReadContract({
    address: lotteryAddress,
    abi: Lottery.abi,
    functionName: "ownerPool",
  });
  console.log(data);

  if (isLoading) return <div>Fetching owner pool balance ...</div>;
  if (isError) return <div>Error fetching owner pool balance ...</div>;
  return <div>Owner Pool is: {formatEther(data)}</div>;
}

function GetPrizePool() {
  const { data, isError, isLoading } = useReadContract({
    address: lotteryAddress,
    abi: Lottery.abi,
    functionName: "prizePool",
  });
  console.log(data);

  if (isLoading) return <div>Fetching prize pool balance ...</div>;
  if (isError) return <div>Error fetching prize pool balance ...</div>;
  return <div>Prize pool is: {formatEther(data)}</div>;
}

function PrizeLimit() {
  const { data, isError, isLoading } = useReadContract({
    address: lotteryAddress,
    abi: [
      {
        constant: true,
        inputs: [peterAddress],
        name: "prize",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "prize",
    account: peterAddress,
  });

  console.log(data);

  if (isLoading) return <div>Fetching prize limit ...</div>;
  if (isError) return <div>Error fetching prize limit, perhaps lottery is still open ...</div>;
  return (
    <div>
      Prize limit for {peterAddress} is: {formatEther(data)}
    </div>
  );
}

function PrizeWithdraw() {
  const { writeContract } = useWriteContract();
  const { data, isError, isLoading } = useReadContract({
    address: lotteryAddress,
    abi: Lottery.abi,
    functionName: "prizePool",
  });

  return (
    <button
      className="btn btn-active btn-neutral"
      onClick={() =>
        writeContract({
          abi: Lottery.abi,
          address: lotteryAddress,
          functionName: "prizeWithdraw",
          args: [parseEther("2")],
          account: peterAddress,
        })
      }
    >
      Award Prize Pool
    </button>
  );
}

function OwnerWithdraw() {
  const { writeContract } = useWriteContract();
  const { data, isError, isLoading } = useReadContract({
    address: lotteryAddress,
    abi: Lottery.abi,
    functionName: "ownerPool",
  });

  return (
    <button
      className="btn btn-active btn-neutral"
      onClick={() =>
        writeContract({
          abi: Lottery.abi,
          address: lotteryAddress,
          functionName: "prizeWithdraw",
          args: [parseEther(data)],
          account: deployerAddress,
        })
      }
    >
      Award Owner Fees
    </button>
  );
}

function CloseLottery() {
  const { writeContract } = useWriteContract();
  return (
    <button
      className="btn btn-active btn-neutral"
      onClick={() =>
        writeContract({ abi: Lottery.abi, address: lotteryAddress, functionName: "closeLottery", args: [] })
      }
    >
      Close Lottery
    </button>
  );
}

function ApiDataOpen(params: { address: string }) {
  return (
    <div className="card w-150 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Click to open lottery ... </h2>
        <OpenBets></OpenBets>
      </div>
      <div className="card-body">
        <h2 className="card-title">Click to request tokens ... </h2>
        <PurchaseTokens></PurchaseTokens>
      </div>
      <div className="card-body">
        <h2 className="card-title">Click to bet ... </h2>
        <Bet></Bet>
      </div>
    </div>
  );
}

function ApiDataClose(params: { address: string }) {
  return (
    <div className="card w-150 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Click to award prizes ... </h2>
        <CloseLottery></CloseLottery>
      </div>

      <div className="card-body">
        <h2 className="card-title">Click to withdraw prizes ... </h2>
        <PrizeWithdraw></PrizeWithdraw>
      </div>
      <div className="card-body">
        <h2 className="card-title">Click to withdraw owner fees ... </h2>
        <OwnerWithdraw></OwnerWithdraw>
      </div>
      <div className="card-body">
        <h2 className="card-title">Click to approve burning ... </h2>
        <ApproveSpender></ApproveSpender>
      </div>
      <div className="card-body">
        <h2 className="card-title">Click to burn tokens ... </h2>
        <ReturnTokens></ReturnTokens>
      </div>
    </div>
  );
}

export default Home;
