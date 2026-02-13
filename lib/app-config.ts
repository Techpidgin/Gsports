const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

function asAddress(value: string | undefined): `0x${string}` {
  if (!value) return ZERO_ADDRESS;
  const v = value.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(v)) return v as `0x${string}`;
  return ZERO_ADDRESS;
}

export const APP_CONFIG = {
  affiliateAddress: asAddress(process.env.NEXT_PUBLIC_AFFILIATE_ADDRESS),
  ownerAddress: asAddress(process.env.NEXT_PUBLIC_OWNER_ADDRESS),
  treasuryAddress: asAddress(process.env.NEXT_PUBLIC_TREASURY_ADDRESS),
  promoCampaignId: process.env.NEXT_PUBLIC_PROMO_CAMPAIGN_ID?.trim() || 'GIB-LIVE',
  promoHeadline:
    process.env.NEXT_PUBLIC_PROMO_HEADLINE?.trim() ||
    'Fully on-chain sportsbook powered by Azuro',
  promoSecondary:
    process.env.NEXT_PUBLIC_PROMO_SECONDARY?.trim() ||
    'AI-agent ready betting with instant self-cashout control',
};

export { ZERO_ADDRESS };
