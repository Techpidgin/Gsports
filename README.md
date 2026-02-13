# Gibisbig

Production-ready super app for decentralized betting on the **Azuro Protocol**. Supports all Azuro chains (Gnosis, Polygon, Chiliz, Base), Solana wallet connection, and full SDK features: prematch/live markets, bet placement, cashout, freebets, wrap/unwrap, redeem winnings.

## Features

- **Multi-chain**: Gnosis, Polygon, Polygon Amoy, Chiliz, Chiliz Spicy, Base, Base Sepolia
- **Wallets**: EVM (MetaMask, WalletConnect, etc.) + Solana (Phantom, Solflare)
- **Markets**: Prematch and live games, conditions, outcomes, real-time odds (Azuro SDK)
- **Betting**: Single and combo bets, bet slip, fee and max bet, place bet
- **Cashout**: Precalculated cashouts for active bets (when supported on chain)
- **Freebets**: Bonuses and available freebets
- **Wrap/Unwrap**: Native token ↔ bet token
- **History**: Bet history, redeem winnings, simple stats
- **UI**: Responsive dark UI, Sonner toasts, Shadcn/UI

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18
- **Azuro**: @azuro-org/sdk, @azuro-org/toolkit, @azuro-org/dictionaries
- **EVM**: wagmi, viem
- **Solana**: @solana/web3.js, @solana/wallet-adapter-react
- **UI**: Tailwind CSS, Shadcn/UI (Radix), Lucide, TanStack Query
- **Toasts**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
git clone <repo>
cd "GIB SPORTS"
npm install
```

If you see peer dependency or optional dependency errors (e.g. React 18 vs 19, or `graphql-tag` / `@azuro-org/sdk-social-aa-connector` missing), use:

```bash
npm install --legacy-peer-deps
```

Ensure `graphql-tag` and `@azuro-org/sdk-social-aa-connector` are installed (they are listed in `package.json`).

After install, `postinstall` runs `patch-package` to apply a patch to `@azuro-org/sdk`. Patches live in `patches/`.

**SDK patch:** The Azuro SDK’s internal `useOdds` hook can receive `selections` as `undefined` when the betslip or market passes the wrong shape. The patch changes `selections?.reduce(...)` to `(selections ?? []).reduce(...)` so the hook never throws. The app also reads odds from `useConditions` (condition outcomes) instead of `useOdds` where appropriate.

### Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_AFFILIATE_ADDRESS` (optional): Your Azuro affiliate address
- `NEXT_PUBLIC_SOLANA_RPC` (optional): Solana RPC URL (default: mainnet-beta)

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_AFFILIATE_ADDRESS` (optional)
   - `NEXT_PUBLIC_SOLANA_RPC` (optional)
3. Deploy. No extra config needed for Next.js.

## Project Structure

- `app/` – Next.js App Router (pages: `/`, `/markets`, `/live`, `/bets`, `/history`, `/cashout`, `/freebets`, `/wrap`)
- `components/` – UI (button, card, dialog, etc.), layout (header), market (MarketCard), betslip (BetSlip), wallet (WalletButton, ChainSelect)
- `providers/` – Theme, Wagmi + Azuro SDK + QueryClient, Solana wallet
- `lib/` – Azuro chain config, wagmi config, utils

## Azuro Docs

- [Developer Hub](https://gem.azuro.org/)
- [SDK](https://gem.azuro.org/hub/apps/sdk/overview)
- [Toolkit](https://gem.azuro.org/hub/apps/toolkit/overview)
- [Deployment Addresses](https://gem.azuro.org/hub/blockchains/deployment-addresses)

## License

MIT
