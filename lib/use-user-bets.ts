'use client';

import { useMemo } from 'react';
import { useBets } from '@azuro-org/sdk';
import { useAccount } from 'wagmi';

type BetItem = {
  tokenId: string;
  isWin?: boolean;
  isLose?: boolean;
  isRedeemed?: boolean;
  isRedeemable?: boolean;
  coreAddress: string;
  lpAddress: string;
  freebetId: string | null;
  paymaster: string | null;
  amount?: string;
  payout?: string | number | null;
  totalOdds?: number;
  status?: string;
};

export function useUserBets() {
  const { address } = useAccount();
  const bettor = (address ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;
  const { data, isLoading, isFetching, refetch } = useBets({
    filter: { bettor },
    query: {
      enabled: Boolean(address),
      refetchInterval: 20_000,
      staleTime: 10_000,
    },
  });

  const bets = useMemo<BetItem[]>(() => {
    return (data?.pages?.flatMap((page) => page.bets) ?? []) as BetItem[];
  }, [data]);

  const settledBets = useMemo(
    () => bets.filter((bet) => bet.isWin || bet.isLose || bet.isRedeemed),
    [bets]
  );
  const activeBets = useMemo(
    () => bets.filter((bet) => !bet.isWin && !bet.isLose && !bet.isRedeemed),
    [bets]
  );
  const wonBets = useMemo(() => bets.filter((bet) => bet.isWin), [bets]);
  const lostBets = useMemo(() => bets.filter((bet) => bet.isLose), [bets]);
  const redeemableBets = useMemo(
    () => bets.filter((bet) => bet.isRedeemable && !bet.isRedeemed),
    [bets]
  );

  return {
    address,
    bets,
    settledBets,
    activeBets,
    wonBets,
    lostBets,
    redeemableBets,
    isLoading: Boolean(address) && isLoading,
    isRefreshing: Boolean(address) && isFetching,
    refetch,
  };
}
