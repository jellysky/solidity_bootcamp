/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../common";
import type { HelloWorld, HelloWorldInterface } from "../HelloWorld";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "helloWorld",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newText",
        type: "string",
      },
    ],
    name: "setText",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060408051808201909152600b81526a12195b1b1bc815dbdc9b1960aa1b602082015260009061004090826100e5565b506101a4565b634e487b7160e01b600052604160045260246000fd5b600181811c9082168061007057607f821691505b60208210810361009057634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156100e057600081815260208120601f850160051c810160208610156100bd5750805b601f850160051c820191505b818110156100dc578281556001016100c9565b5050505b505050565b81516001600160401b038111156100fe576100fe610046565b6101128161010c845461005c565b84610096565b602080601f831160018114610147576000841561012f5750858301515b600019600386901b1c1916600185901b1785556100dc565b600085815260208120601f198616915b8281101561017657888601518255948401946001909101908401610157565b50858210156101945787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6103a4806101b36000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80635d3a1f9d1461003b578063c605f76c14610050575b600080fd5b61004e610049366004610126565b61006e565b005b61005861007e565b60405161006591906101d7565b60405180910390f35b600061007a82826102ae565b5050565b60606000805461008d90610225565b80601f01602080910402602001604051908101604052809291908181526020018280546100b990610225565b80156101065780601f106100db57610100808354040283529160200191610106565b820191906000526020600020905b8154815290600101906020018083116100e957829003601f168201915b5050505050905090565b634e487b7160e01b600052604160045260246000fd5b60006020828403121561013857600080fd5b813567ffffffffffffffff8082111561015057600080fd5b818401915084601f83011261016457600080fd5b81358181111561017657610176610110565b604051601f8201601f19908116603f0116810190838211818310171561019e5761019e610110565b816040528281528760208487010111156101b757600080fd5b826020860160208301376000928101602001929092525095945050505050565b600060208083528351808285015260005b81811015610204578581018301518582016040015282016101e8565b506000604082860101526040601f19601f8301168501019250505092915050565b600181811c9082168061023957607f821691505b60208210810361025957634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156102a957600081815260208120601f850160051c810160208610156102865750805b601f850160051c820191505b818110156102a557828155600101610292565b5050505b505050565b815167ffffffffffffffff8111156102c8576102c8610110565b6102dc816102d68454610225565b8461025f565b602080601f83116001811461031157600084156102f95750858301515b600019600386901b1c1916600185901b1785556102a5565b600085815260208120601f198616915b8281101561034057888601518255948401946001909101908401610321565b508582101561035e5787850151600019600388901b60f8161c191681555b5050505050600190811b0190555056fea2646970667358221220854745ffa754904f95d4ef0529235fa4031db61523a16b718834d2094e04e8ab64736f6c63430008110033";

type HelloWorldConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: HelloWorldConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class HelloWorld__factory extends ContractFactory {
  constructor(...args: HelloWorldConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      HelloWorld & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): HelloWorld__factory {
    return super.connect(runner) as HelloWorld__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): HelloWorldInterface {
    return new Interface(_abi) as HelloWorldInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): HelloWorld {
    return new Contract(address, _abi, runner) as unknown as HelloWorld;
  }
}