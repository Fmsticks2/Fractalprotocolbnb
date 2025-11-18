import { useMemo, useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { toast } from 'sonner'
import type { Market, MarketOdds, PlaceBetForm } from '../types'
import MarketCard from '../components/MarketCard'
import PlaceBetModal from '../components/PlaceBetModal'
import { listMarketAddresses, getMarket, getOdds, placeBet } from '../services/markets'

const ExploreMarkets = () => {
  const [search, setSearch] = useState('')
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [oddsMap, setOddsMap] = useState<Record<string, MarketOdds>>({})
  const [isBetOpen, setIsBetOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  const chainId = useChainId()
  const { address } = useAccount()
  const { data: balanceData } = useBalance({ address, chainId })
  const userBalance = balanceData?.value ? Number(formatEther(balanceData.value)) : 0

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const addresses = await listMarketAddresses(chainId)
        const list: Market[] = []
        for (const addr of addresses) {
          const m = await getMarket(addr)
          list.push(m)
        }
        setMarkets(list)
        // Preload odds for each market
        const oddsEntries: [string, MarketOdds][] = []
        for (const m of list) {
          try {
            const o = await getOdds(m.id as any)
            oddsEntries.push([m.id, o])
          } catch {}
        }
        setOddsMap(Object.fromEntries(oddsEntries))
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch markets')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [chainId])

  const displayMarkets = useMemo(() => {
    let rows = markets.slice()
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      rows = rows.filter(m => m.question.toLowerCase().includes(q))
    }
    return rows
  }, [markets, search])

  const onViewMarket = (_marketId: string) => {
    toast.info('Market details page coming soon')
  }

  const openBet = (marketId: string) => {
    const m = markets.find(mm => mm.id === marketId) || null
    setSelectedMarket(m)
    setIsBetOpen(!!m)
  }

  const handlePlaceBet = async (form: PlaceBetForm) => {
    if (!selectedMarket) return
    const index = selectedMarket.outcomes.indexOf(form.outcome)
    if (index < 0) throw new Error('Outcome not found')
    try {
      const tx = await placeBet(selectedMarket.id as any, index, form.amount)
      toast.success(`Bet placed! Tx: ${tx}`)
      setIsBetOpen(false)
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to place bet')
    }
  }

  // Removed unused gradientForCategory helper

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-500/10 border border-secondary-500/20 text-secondary-400 text-sm font-medium mb-4">
              <Icon icon="mdi:compass-outline" className="w-4 h-4 mr-2" />
              Explore Markets
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white">Discover trending prediction markets</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Filter by category, tags, and popularity to find opportunities that match your interests. Professional layout and data at-a-glance.
            </p>
          </div>
          <Link to="/create" className="hidden md:inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-xl font-semibold">
            <Icon icon="mdi:target" className="w-5 h-5" />
            Create Market
          </Link>
        </div>

        {/* Search */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Search</label>
              <div className="relative">
                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search markets..."
                  className="w-full bg-input text-white placeholder-white/50 border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-card/50 border border-border rounded-2xl p-6 animate-pulse">
              <div className="w-14 h-14 bg-white/10 rounded-xl mb-4" />
              <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-3 w-1/2 bg-white/10 rounded mb-4" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-12 bg-white/10 rounded" />
                <div className="h-12 bg-white/10 rounded" />
                <div className="h-12 bg-white/10 rounded" />
              </div>
              <div className="h-2 w-full bg-white/10 rounded mt-3" />
              <div className="mt-6 h-10 bg-white/10 rounded" />
            </div>
          ))}

          {!loading && displayMarkets.map((m) => (
            <MarketCard
              key={m.id}
              market={m}
              odds={oddsMap[m.id]}
              onViewMarket={onViewMarket}
              onPlaceBet={openBet}
            />
          ))}
        </div>

        {/* Empty state */}
        {!loading && displayMarkets.length === 0 && (
          <div className="text-center py-16">
            <Icon icon="mdi:folder-outline" className="mx-auto w-10 h-10 text-muted-foreground" />
            <h3 className="mt-4 text-white font-semibold">No markets found</h3>
            <p className="text-muted-foreground">Try adjusting filters or search terms.</p>
          </div>
        )}

        {/* Bet Modal */}
        <PlaceBetModal
          isOpen={isBetOpen}
          onClose={() => setIsBetOpen(false)}
          market={selectedMarket}
          odds={selectedMarket ? oddsMap[selectedMarket.id] : undefined}
          userBalance={userBalance}
          onPlaceBet={handlePlaceBet}
        />

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <Link to="/create" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-full font-semibold">
            <Icon icon="mdi:plus-circle" className="w-5 h-5" />
            Create a New Market
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ExploreMarkets
