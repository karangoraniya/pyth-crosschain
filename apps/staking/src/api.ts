// TODO remove these disables when moving off the mock APIs
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

import {
  getAmountByTargetAndState,
  getCurrentEpoch,
  PositionState,
  PythStakingClient,
  type StakeAccountPositions,
} from "@pythnetwork/staking-sdk";
import { PublicKey } from "@solana/web3.js";

type Data = {
  total: bigint;
  availableRewards: bigint;
  lastSlash:
    | {
        amount: bigint;
        date: Date;
      }
    | undefined;
  expiringRewards:
    | {
        amount: bigint;
        expiry: Date;
      }
    | undefined;
  locked: bigint;
  unlockSchedule: {
    date: Date;
    amount: bigint;
  }[];
  walletAmount: bigint;
  governance: {
    warmup: bigint;
    staked: bigint;
    cooldown: bigint;
    cooldown2: bigint;
  };
  integrityStakingPublishers: {
    name: string | undefined;
    publicKey: PublicKey;
    isSelf: boolean;
    selfStake: bigint;
    poolCapacity: bigint;
    poolUtilization: bigint;
    numFeeds: number;
    qualityRanking: number;
    apyHistory: { date: Date; apy: number }[];
    positions?:
      | {
          warmup?: bigint | undefined;
          staked?: bigint | undefined;
          cooldown?: bigint | undefined;
          cooldown2?: bigint | undefined;
        }
      | undefined;
  }[];
};

export enum StakeType {
  Governance,
  IntegrityStaking,
}

const StakeDetails = {
  Governance: () => ({ type: StakeType.Governance as const }),
  IntegrityStaking: (publisherName: string) => ({
    type: StakeType.IntegrityStaking as const,
    publisherName,
  }),
};

export type StakeDetails = ReturnType<
  (typeof StakeDetails)[keyof typeof StakeDetails]
>;

export enum AccountHistoryItemType {
  AddTokens,
  LockedDeposit,
  Withdrawal,
  RewardsCredited,
  Claim,
  Slash,
  Unlock,
  StakeCreated,
  StakeFinishedWarmup,
  UnstakeCreated,
  UnstakeExitedCooldown,
}

const AccountHistoryAction = {
  AddTokens: () => ({ type: AccountHistoryItemType.AddTokens as const }),
  LockedDeposit: (unlockDate: Date) => ({
    type: AccountHistoryItemType.LockedDeposit as const,
    unlockDate,
  }),
  Withdrawal: () => ({ type: AccountHistoryItemType.Withdrawal as const }),
  RewardsCredited: () => ({
    type: AccountHistoryItemType.RewardsCredited as const,
  }),
  Claim: () => ({ type: AccountHistoryItemType.Claim as const }),
  Slash: (publisherName: string) => ({
    type: AccountHistoryItemType.Slash as const,
    publisherName,
  }),
  Unlock: () => ({ type: AccountHistoryItemType.Unlock as const }),
  StakeCreated: (details: StakeDetails) => ({
    type: AccountHistoryItemType.StakeCreated as const,
    details,
  }),
  StakeFinishedWarmup: (details: StakeDetails) => ({
    type: AccountHistoryItemType.StakeFinishedWarmup as const,
    details,
  }),
  UnstakeCreated: (details: StakeDetails) => ({
    type: AccountHistoryItemType.UnstakeCreated as const,
    details,
  }),
  UnstakeExitedCooldown: (details: StakeDetails) => ({
    type: AccountHistoryItemType.UnstakeExitedCooldown as const,
    details,
  }),
};

export type AccountHistoryAction = ReturnType<
  (typeof AccountHistoryAction)[keyof typeof AccountHistoryAction]
>;

type AccountHistory = {
  timestamp: Date;
  action: AccountHistoryAction;
  amount: bigint;
  accountTotal: bigint;
  availableToWithdraw: bigint;
  availableRewards: bigint;
  locked: bigint;
}[];

export const getStakeAccounts = async (
  client: PythStakingClient,
): Promise<StakeAccountPositions[]> =>
  client.getAllStakeAccountPositions(client.wallet.publicKey);

export const loadData = async (
  client: PythStakingClient,
  stakeAccount: StakeAccountPositions,
): Promise<Data> => {
  const [
    stakeAccountCustody,
    publishers,
    ownerAtaAccount,
    currentEpoch,
    unlockSchedule,
  ] = await Promise.all([
    client.getStakeAccountCustody(stakeAccount.address),
    client.getPublishers(),
    client.getOwnerPythAtaAccount(),
    getCurrentEpoch(client.connection),
    client.getUnlockSchedule(stakeAccount.address),
  ]);

  const filterGovernancePositions = (positionState: PositionState) =>
    getAmountByTargetAndState({
      stakeAccountPositions: stakeAccount,
      targetWithParameters: { voting: {} },
      positionState,
      epoch: currentEpoch,
    });

  const filterOISPositions = (
    publisher: PublicKey,
    positionState: PositionState,
  ) =>
    getAmountByTargetAndState({
      stakeAccountPositions: stakeAccount,
      targetWithParameters: { integrityPool: { publisher } },
      positionState,
      epoch: currentEpoch,
    });

  return {
    lastSlash: undefined, // TODO
    availableRewards: 0n, // TODO
    expiringRewards: undefined, // TODO
    total: stakeAccountCustody.amount,
    governance: {
      warmup: filterGovernancePositions(PositionState.LOCKING),
      staked: filterGovernancePositions(PositionState.LOCKED),
      cooldown: filterGovernancePositions(PositionState.PREUNLOCKING),
      cooldown2: filterGovernancePositions(PositionState.UNLOCKED),
    },
    unlockSchedule,
    locked: unlockSchedule.reduce((sum, { amount }) => sum + amount, 0n),
    walletAmount: ownerAtaAccount.amount,
    integrityStakingPublishers: publishers.map(({ pubkey: publisher }) => ({
      apyHistory: [], // TODO
      isSelf: false, // TODO
      name: undefined, // TODO
      numFeeds: 0, // TODO
      poolCapacity: 100n, // TODO
      poolUtilization: 0n, // TODO
      publicKey: publisher,
      qualityRanking: 0, // TODO
      selfStake: 0n, // TODO
      positions: {
        warmup: filterOISPositions(publisher, PositionState.LOCKING),
        staked: filterOISPositions(publisher, PositionState.LOCKED),
        cooldown: filterOISPositions(publisher, PositionState.PREUNLOCKING),
        cooldown2: filterOISPositions(publisher, PositionState.UNLOCKED),
      },
    })),
  };
};

export const loadAccountHistory = async (
  _client: PythStakingClient,
  _stakeAccount: PublicKey,
): Promise<AccountHistory> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return mkMockHistory();
};

export const deposit = async (
  client: PythStakingClient,
  stakeAccount: PublicKey,
  amount: bigint,
): Promise<void> => {
  await client.depositTokensToStakeAccountCustody(stakeAccount, amount);
};

export const withdraw = async (
  client: PythStakingClient,
  stakeAccount: PublicKey,
  amount: bigint,
): Promise<void> => {
  await client.withdrawTokensFromStakeAccountCustody(stakeAccount, amount);
};

export const claim = async (
  client: PythStakingClient,
  stakeAccount: PublicKey,
): Promise<void> => {
  await client.advanceDelegationRecord(stakeAccount);
};

export const stakeGovernance = async (
  client: PythStakingClient,
  stakeAccount: PublicKey,
  amount: bigint,
): Promise<void> => {
  await client.stakeToGovernance(stakeAccount, amount);
};

export const cancelWarmupGovernance = async (
  _client: PythStakingClient,
  _stakeAccount: PublicKey,
  _amount: bigint,
): Promise<void> => {
  throw new NotImplementedError();
};

export const unstakeGovernance = async (
  _client: PythStakingClient,
  _stakeAccount: PublicKey,
  _amount: bigint,
): Promise<void> => {
  throw new NotImplementedError();
};

export const delegateIntegrityStaking = async (
  client: PythStakingClient,
  stakeAccount: PublicKey,
  publisherKey: PublicKey,
  amount: bigint,
): Promise<void> => {
  await client.stakeToPublisher(stakeAccount, publisherKey, amount);
};

export const cancelWarmupIntegrityStaking = async (
  _client: PythStakingClient,
  _stakeAccount: PublicKey,
  _publisherKey: PublicKey,
  _amount: bigint,
): Promise<void> => {
  throw new NotImplementedError();
};

export const unstakeIntegrityStaking = async (
  _client: PythStakingClient,
  _stakeAccount: PublicKey,
  _publisherKey: PublicKey,
  _amount: bigint,
): Promise<void> => {
  throw new NotImplementedError();
};

export const calculateApy = (
  poolCapacity: bigint,
  poolUtilization: bigint,
  isSelf: boolean,
) => {
  const maxApy = isSelf ? 25 : 20;
  const minApy = isSelf ? 10 : 5;
  return Math.min(
    Math.max(
      maxApy - Number((poolUtilization - poolCapacity) / 100_000_000n),
      minApy,
    ),
    maxApy,
  );
};

export const getUpcomingEpoch = (): Date => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((5 + 7 - d.getUTCDay()) % 7 || 7));
  d.setUTCHours(0);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  d.setUTCMilliseconds(0);
  return d;
};

export const getNextFullEpoch = (): Date => {
  const d = getUpcomingEpoch();
  d.setUTCDate(d.getUTCDate() + 7);
  return d;
};

const MOCK_DELAY = 500;

const mkMockHistory = (): AccountHistory => [
  {
    timestamp: new Date("2024-06-10T00:00:00Z"),
    action: AccountHistoryAction.AddTokens(),
    amount: 2_000_000n,
    accountTotal: 2_000_000n,
    availableRewards: 0n,
    availableToWithdraw: 2_000_000n,
    locked: 0n,
  },
  {
    timestamp: new Date("2024-06-14T02:00:00Z"),
    action: AccountHistoryAction.RewardsCredited(),
    amount: 200n,
    accountTotal: 2_000_000n,
    availableRewards: 200n,
    availableToWithdraw: 2_000_000n,
    locked: 0n,
  },
  {
    timestamp: new Date("2024-06-16T08:00:00Z"),
    action: AccountHistoryAction.Claim(),
    amount: 200n,
    accountTotal: 2_000_200n,
    availableRewards: 0n,
    availableToWithdraw: 2_000_200n,
    locked: 0n,
  },
  {
    timestamp: new Date("2024-06-16T08:00:00Z"),
    action: AccountHistoryAction.Slash("Cboe"),
    amount: 1000n,
    accountTotal: 1_999_200n,
    availableRewards: 0n,
    availableToWithdraw: 1_999_200n,
    locked: 0n,
  },
];

class NotImplementedError extends Error {
  constructor() {
    super("Not yet implemented!");
    this.name = "NotImplementedError";
  }
}
