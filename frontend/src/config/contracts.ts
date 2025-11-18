import type { Address } from 'viem'

// Minimal ABIs for MarketFactory and Market contracts
export const MARKET_FACTORY_ABI = [
  {
    type: 'event',
    name: 'MarketCreated',
    inputs: [
      { name: 'market', type: 'address', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'question', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'SubMarketSpawned',
    inputs: [
      { name: 'parent', type: 'address', indexed: true },
      { name: 'child', type: 'address', indexed: true },
      { name: 'question', type: 'string', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'marketsCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getAllMarkets',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'createMarket',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'outcomes', type: 'string[]' },
      { name: 'expiryTime', type: 'uint256' },
      { name: 'parentMarket', type: 'address' },
    ],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'spawnSubMarket',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'parent', type: 'address' },
      { name: 'newQuestion', type: 'string' },
      { name: 'newOutcomes', type: 'string[]' },
      { name: 'newExpiryTime', type: 'uint256' },
    ],
    outputs: [{ type: 'address' }],
  },
] as const

export const MARKET_ABI = [
  // getters
  { type: 'function', name: 'factory', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'creator', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'parentMarket', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'question', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'outcomes', stateMutability: 'view', inputs: [{ type: 'uint256' }], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'outcomesCount', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'expiryTime', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'stakes', stateMutability: 'view', inputs: [{ type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'outcomeStakes', stateMutability: 'view', inputs: [{ type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalStaked', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'resolved', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'winningOutcomeIndex', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'childMarkets', stateMutability: 'view', inputs: [{ type: 'uint256' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'childMarketsCount', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  // actions
  { type: 'function', name: 'placeBet', stateMutability: 'payable', inputs: [{ type: 'uint256', name: 'outcomeIndex' }], outputs: [] },
  { type: 'function', name: 'resolve', stateMutability: 'nonpayable', inputs: [{ type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'addChildMarket', stateMutability: 'nonpayable', inputs: [{ type: 'address' }], outputs: [] },
  // events
  { type: 'event', name: 'BetPlaced', inputs: [
    { name: 'bettor', type: 'address', indexed: true },
    { name: 'outcomeIndex', type: 'uint256', indexed: true },
    { name: 'amount', type: 'uint256', indexed: false },
  ] },
  { type: 'event', name: 'MarketResolved', inputs: [
    { name: 'winningOutcomeIndex', type: 'uint256', indexed: false },
  ] },
  { type: 'event', name: 'ChildMarketAdded', inputs: [
    { name: 'child', type: 'address', indexed: true },
  ] },
] as const

// Resolve factory address from env by chain id (56 mainnet, 97 testnet)
export function getFactoryAddress(chainId?: number): Address {
  const envMain = (import.meta.env.VITE_FACTORY_ADDRESS as string | undefined) || ''
  const envTest = (import.meta.env.VITE_FACTORY_ADDRESS_TESTNET as string | undefined) || ''

  if (chainId === 56 && envMain) return envMain as Address
  if (chainId === 97 && envTest) return envTest as Address
  // Fallback: prefer testnet variable in dev
  return (envTest || envMain) as Address
}