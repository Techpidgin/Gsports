'use client';

import { useChain } from '@azuro-org/sdk';
import type { ChainId } from '@azuro-org/toolkit';
import { useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { AZURO_CHAIN_NAMES, DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_IDS } from '@/lib/azuro-chains';

export function ChainSelect() {
  const chain = useChain();
  const chainId = chain?.appChain?.id ?? DEFAULT_CHAIN_ID;
  const setChainId = chain.setAppChainId;
  const { switchChainAsync, isPending } = useSwitchChain();

  const handleSelect = async (id: ChainId) => {
    setChainId(id);
    try {
      await switchChainAsync?.({ chainId: id });
    } catch {
      // User may have rejected or chain not in wallet
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[140px]" disabled={isPending}>
          {AZURO_CHAIN_NAMES[chainId] ?? `Chain ${chainId}`}
          <ChevronDown className="h-4 w-4 opacity-50" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Azuro network</DropdownMenuLabel>
        {SUPPORTED_CHAIN_IDS.map((id) => (
          <DropdownMenuItem key={id} onClick={() => handleSelect(id as ChainId)}>
            <span className="flex-1">{AZURO_CHAIN_NAMES[id]}</span>
            {chainId === id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
