import { clsx, type ClassValue } from "clsx"
import { Contract, Provider, ProviderInterface, SignerInterface, utils } from "koilib"
import { twMerge } from "tailwind-merge"
import abiKoinosFund from "./abiKoinosFund"
import { isTransientRpcError, withRetry } from "./retry"

// const RPC_TESTNET = "https://rpc.koinos-testnet.com";
// const RPC_MAINNET = "https://api.koinos.io";

// export const KOIN_ADDRESS = "1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju";
// export const FUND_ADDRESS = "18h1MU6z4LkD7Lk2BohhejA9j61TDUwvRB";

export const KOIN_ADDRESS = "19GYjDBVXU7keLbYvMLazsGQn3GTWHjHkK";
export const FUND_ADDRESS = "1A5BmMqV5jN5zBrdkhQumAfDZBzXLPBeN9";


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

export interface ProcessedProject extends Omit<Project, 'monthly_payment' | 'start_date' | 'end_date'> {
  monthly_payment: string; // KOIN, 8 decimals
  start_date: Date;
  end_date: Date;
  total_votes: string; // KOIN, 8 decimals
}

const KOIN_UNITS = 1e8;
// Project vote totals are stored in 5% vote units of KOIN satoshis
const VOTE_UNITS = 20 * KOIN_UNITS;

/**
 * Read-only connection to the public RPC, shared by every read. The node turns
 * away bursts of requests ("Failed to fetch") and sometimes times out inside
 * ("context deadline exceeded"), so those calls are retried after a pause.
 */
class RetryingProvider extends Provider {
  async call<T = unknown>(method: string, params: unknown): Promise<T> {
    return withRetry(() => super.call<T>(method, params), {
      attempts: 3,
      delayMs: 1000,
      shouldRetry: isTransientRpcError,
    });
  }
}

const readProvider = new RetryingProvider("https://api.koinos.io");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFundContract(
  provider: ProviderInterface = readProvider,
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
  provider: ProviderInterface = readProvider,
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

export async function fetchUserVotes(voter: string): Promise<ProcessedVote[]> {
  const { result } = await getFundContract().functions.get_user_votes<{ votes: Vote[] }>({ voter });
  return (result?.votes || []).map(vote => ({
    ...vote,
    // The payout at this time is the last one the vote counts in
    expiration: new Date(parseInt(vote.expiration)),
  }));
}

export function toProcessedProject(project: Project): ProcessedProject {
  return {
    ...project,
    monthly_payment: (parseInt(project.monthly_payment) / KOIN_UNITS).toFixed(8),
    start_date: new Date(parseInt(project.start_date)),
    end_date: new Date(parseInt(project.end_date)),
    total_votes: (project.votes.reduce((acc, vote) => acc + parseInt(vote), 0) / VOTE_UNITS).toFixed(8),
  };
}

/** One month's expiring votes, in KOIN. */
export function voteUnitsToKoin(raw: string): number {
  return parseInt(raw) / VOTE_UNITS;
}

/** Projects with a given status, most votes first, up to `maxPages` pages of 10. */
export async function fetchProjects(status: ProjectStatus, maxPages = 3): Promise<ProcessedProject[]> {
  const fund = getFundContract();
  const projects: Project[] = [];
  let start = "9".repeat(30);
  for (let page = 0; page < maxPages; page++) {
    const { result } = await fund.functions.get_projects<{ projects: Project[]; start_next_page: string }>({
      status,
      order_by: OrderBy.Votes,
      limit: 10,
      start,
      descending: true,
    });
    const batch = result?.projects || [];
    projects.push(...batch);
    if (!result?.start_next_page || batch.length === 0) break;
    start = result.start_next_page;
  }
  return projects.map(toProcessedProject);
}
