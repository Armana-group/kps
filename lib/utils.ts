import { clsx, type ClassValue } from "clsx"
import { Contract, Provider, ProviderInterface } from "koilib"
import { twMerge } from "tailwind-merge"
import abiKoinosFund from "./abiKoinosFund"

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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFundContract(
  // TODO: create useWallet component to get the provider
  provider: ProviderInterface = new Provider("https://rpc.koinos-testnet.com"),
  address: string = "18h1MU6z4LkD7Lk2BohhejA9j61TDUwvRB"
): Contract {
  return new Contract({
    id: address,
    provider,
    abi: abiKoinosFund,
  });
}
