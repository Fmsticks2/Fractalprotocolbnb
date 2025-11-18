import { readContract, simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'
import { config } from '../config/wagmi'
import { MARKET_ABI, MARKET_FACTORY_ABI, getFactoryAddress } from '../config/contracts'
import type { Address, Hex } from 'viem'
import { formatEther, parseEther } from 'viem'
import type { Market, MarketOdds } from '../types'

export async function listMarketAddresses(chainId?: number): Promise<Address[]> {
  const factory = getFactoryAddress(chainId)
  const addresses = await readContract(config, {
    address: factory,
    abi: MARKET_FACTORY_ABI,
    functionName: 'getAllMarkets',
    args: [],
  })
  return addresses as Address[]
}

export async function getMarket(address: Address): Promise<Market> {
  const [question, outcomesCount, expiry, totalStakedWei, resolved, winningIndex, creator] = await Promise.all([
    readContract(config, { address, abi: MARKET_ABI, functionName: 'question', args: [] }),
    readContract(config, { address, abi: MARKET_ABI, functionName: 'outcomesCount', args: [] }),
    readContract(config, { address, abi: MARKET_ABI, functionName: 'expiryTime', args: [] }),
    readContract(config, { address, abi: MARKET_ABI, functionName: 'totalStaked', args: [] }),
    readContract(config, { address, abi: MARKET_ABI, functionName: 'resolved', args: [] }),
    readContract(config, { address, abi: MARKET_ABI, functionName: 'winningOutcomeIndex', args: [] }),
    readContract(config, { address, abi: MARKET_ABI, functionName: 'creator', args: [] }),
  ])

  const count = Number(outcomesCount)
  const outcomes: string[] = []
  for (let i = 0; i < count; i++) {
    const o = await readContract(config, { address, abi: MARKET_ABI, functionName: 'outcomes', args: [BigInt(i)] })
    outcomes.push(o as string)
  }

  const expiryDate = new Date(Number(expiry) * 1000)
  const totalStaked = Number(formatEther(totalStakedWei as bigint))
  const childCount = await readContract(config, { address, abi: MARKET_ABI, functionName: 'childMarketsCount', args: [] })
  const children: string[] = []
  for (let i = 0; i < Number(childCount); i++) {
    const child = await readContract(config, { address, abi: MARKET_ABI, functionName: 'childMarkets', args: [BigInt(i)] })
    children.push(child as string)
  }

  const winningOutcome = (resolved as boolean) ? outcomes[Number(winningIndex)] : undefined
  return {
    id: address,
    question: question as string,
    outcomes,
    totalStaked,
    resolved: resolved as boolean,
    winningOutcome,
    childMarkets: children,
    parentMarketId: undefined,
    expiryTime: expiryDate,
    creator: creator as string,
    createdAt: new Date(),
  }
}

export async function getOdds(address: Address): Promise<MarketOdds> {
  const totalStakedWei = await readContract(config, { address, abi: MARKET_ABI, functionName: 'totalStaked', args: [] })
  const total = Number(formatEther(totalStakedWei as bigint))
  const count = await readContract(config, { address, abi: MARKET_ABI, functionName: 'outcomesCount', args: [] })
  const outcomesCount = Number(count)
  const odds: MarketOdds = {}
  for (let i = 0; i < outcomesCount; i++) {
    const label = await readContract(config, { address, abi: MARKET_ABI, functionName: 'outcomes', args: [BigInt(i)] })
    const stakedWei = await readContract(config, { address, abi: MARKET_ABI, functionName: 'outcomeStakes', args: [BigInt(i)] })
    const staked = Number(formatEther(stakedWei as bigint))
    // Avoid divide by zero; if total is 0, use neutral odds = 1
    const o = total > 0 && staked > 0 ? total / staked : 1
    odds[label as string] = o
  }
  return odds
}

export async function createMarket(
  chainId: number | undefined,
  question: string,
  outcomes: string[],
  expiryTime: Date,
  parentMarket?: Address,
): Promise<Address> {
  const factory = getFactoryAddress(chainId)
  const expirySeconds = Math.floor(expiryTime.getTime() / 1000)
  const parent = parentMarket ?? ('0x0000000000000000000000000000000000000000' as Address)

  const { request, result } = await simulateContract(config, {
    address: factory,
    abi: MARKET_FACTORY_ABI,
    functionName: 'createMarket',
    args: [question, outcomes, BigInt(expirySeconds), parent],
  })
  const txHash = await writeContract(config, request)
  await waitForTransactionReceipt(config, { hash: txHash })
  return result as Address
}

export async function placeBet(
  marketAddress: Address,
  outcomeIndex: number,
  amountEth: number,
): Promise<Hex> {
  const value = parseEther(String(amountEth))
  const txHash = await writeContract(config, {
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: 'placeBet',
    args: [BigInt(outcomeIndex)],
    value,
  })
  await waitForTransactionReceipt(config, { hash: txHash })
  return txHash
}

export async function resolveMarket(
  marketAddress: Address,
  winningOutcomeIndex: number,
): Promise<Hex> {
  const txHash = await writeContract(config, {
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: 'resolve',
    args: [BigInt(winningOutcomeIndex)],
  })
  await waitForTransactionReceipt(config, { hash: txHash })
  return txHash
}