# Gibisbig

Production-ready super app for decentralized betting on the **Azuro Protocol**. Supports all Azuro chains (Gnosis, Polygon, Chiliz, Base), Solana wallet connection, and full SDK features: prematch/live markets, bet placement, cashout, freebets, wrap/unwrap, and redeem winnings.

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

### Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_AFFILIATE_ADDRESS`: Azuro affiliate address used for bet/freebet attribution
- `NEXT_PUBLIC_OWNER_ADDRESS` (optional): owner label shown in dashboard badges
- `NEXT_PUBLIC_TREASURY_ADDRESS` (optional): treasury label shown in dashboard badges
- `NEXT_PUBLIC_PROMO_CAMPAIGN_ID` (optional): promo identifier shown in marquee/copy
- `NEXT_PUBLIC_PROMO_HEADLINE` (optional): primary markets hero headline
- `NEXT_PUBLIC_PROMO_SECONDARY` (optional): secondary markets hero line
- `NEXT_PUBLIC_SOLANA_RPC` (optional): Solana RPC URL (default: mainnet-beta)
- `NEXT_PUBLIC_SUPPORT_TELEGRAM_URL` (optional): support link on `/geo`

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
   - `NEXT_PUBLIC_AFFILIATE_ADDRESS`
   - `NEXT_PUBLIC_OWNER_ADDRESS` (optional)
   - `NEXT_PUBLIC_TREASURY_ADDRESS` (optional)
   - `NEXT_PUBLIC_PROMO_CAMPAIGN_ID` (optional)
   - `NEXT_PUBLIC_PROMO_HEADLINE` (optional)
   - `NEXT_PUBLIC_PROMO_SECONDARY` (optional)
   - `NEXT_PUBLIC_SOLANA_RPC` (optional)
   - `NEXT_PUBLIC_SUPPORT_TELEGRAM_URL` (optional)
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
