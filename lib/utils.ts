import { clsx, type ClassValue } from "clsx"
import { Contract, Provider, ProviderInterface, SignerInterface, utils } from "koilib"
import { twMerge } from "tailwind-merge"
import abiKoinosFund from "./abiKoinosFund"

export const KOIN_ADDRESS = "1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju";
export const FUND_ADDRESS = "18h1MU6z4LkD7Lk2BohhejA9j61TDUwvRB";

export enum ProjectStatus {
  Upcoming = 0,
  Active = 1,
  Past = 2,
}

export enum OrderBy {
  Date = 0,
  Votes = 1,
}

export interface Project {
  id: number;
  creator: string;
  beneficiary: string;
  title: string;
  description: string;
  monthly_payment: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  votes: string[];
};

export interface Vote {
  project_id: number;
  weight: number;
  expiration: string;
};

export interface ProcessedVote extends Omit<Vote, 'expiration'> {
  expiration: Date;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFundContract(
  provider: ProviderInterface = new Provider("https://rpc.koinos-testnet.com"),
  signer?: SignerInterface
): Contract {
  const contractOptions: {
    id: string;
    provider: ProviderInterface;
    abi: typeof abiKoinosFund;
    signer?: SignerInterface;
  } = {
    id: FUND_ADDRESS,
    provider,
    abi: abiKoinosFund,
  };

  if (signer) {
    contractOptions.signer = signer;
  }

  return new Contract(contractOptions);
}

export function getKoinContract(
  provider: ProviderInterface = new Provider("https://rpc.koinos-testnet.com"),
  signer?: SignerInterface
): Contract {
  const { tokenAbi } = utils;
  delete (tokenAbi as unknown as {
    koilib_types: {
      nested: {
        koinos: {
          nested: {
            btype?: {
              type: string;
              id: number;
            };
          };
        };
      };
    };
  }).koilib_types.nested?.koinos?.nested?.btype;
  const contract = new Contract({
    id: KOIN_ADDRESS,
    provider,
    abi: tokenAbi,
  });

  if (signer) {
    contract.signer = signer;
  }

  return contract;
}
