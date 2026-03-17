/**
 * Casino Game History – GET /api/v1/master/casino-game-history.
 * Filters: search (user), gameCode, providerCode, from, to. DataTable with server-side pagination.
 */
import { useState, useEffect, useCallback } from 'react'
import { HiTicket, HiRefresh, HiSearch } from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import DataTable from '../components/ui/DataTable'
import Badge from '../components/ui/Badge'
import { useToast } from '../context/ToastContext'
import AuthService from '../api/services/AuthService'

function formatInr(n) {
  return `₹${Number(n ?? 0).toLocaleString('en-IN')}`
}

function formatDateTime(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${day}/${month}/${year}, ${String(h).padStart(2, '0')}:${m} ${ampm}`
}

function userLabel(row) {
  const u = row.user
  if (!u) return '–'
  const parts = [u.fullName, u.mobile, u.uuid].filter(Boolean)
  return parts.length ? parts.join(' • ') : '–'
}

function statusVariant(status) {
  if (!status) return 'neutral'
  const s = String(status).toLowerCase()
  if (s === 'win' || s === 'won') return 'success'
  if (s === 'loss' || s === 'lost') return 'error'
  if (s === 'cancel' || s === 'refund') return 'warning'
  return 'neutral'
}

const DEBOUNCE_MS = 400

export default function CasinoHistory() {
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [gameCode, setGameCode] = useState('')
  const [providerCode, setProviderCode] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { addToast } = useToast()

  const fetchHistory = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = {
      page,
      limit,
      search: searchTerm.trim() || undefined,
      gameCode: gameCode.trim() || undefined,
      providerCode: providerCode.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
    }
    AuthService.getMasterCasinoGameHistory(params)
      .then((res) => {
        if (res?.success && res?.data) {
          setList(res.data.list || [])
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setList([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(res?.message || 'Failed to load game history')
        }
      })
      .catch(() => {
        setList([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        setError('Failed to load game history')
      })
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, gameCode, providerCode, from, to])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, gameCode, providerCode, from, to])

  const columns = [
    { name: 'Sr No.', id: 'srNo', width: '70px', cell: (row, index) => (page - 1) * limit + (index ?? 0) + 1 },
    { name: 'User', id: 'user', cell: (row) => userLabel(row), minWidth: '160px' },
    { name: 'Game', id: 'gameName', selector: (row) => row.gameName, cell: (row) => row.gameName || '–', minWidth: '120px' },
    { name: 'Game Code', id: 'gameCode', selector: (row) => row.gameCode, cell: (row) => row.gameCode || '–', minWidth: '100px' },
    { name: 'Provider', id: 'providerCode', selector: (row) => row.providerCode, cell: (row) => row.providerCode || '–', minWidth: '90px' },
    { name: 'Date / Time', id: 'dateTime', cell: (row) => formatDateTime(row.dateTime), minWidth: '140px' },
    { name: 'Bet Amount', id: 'betAmount', cell: (row) => formatInr(row.betAmount), minWidth: '100px' },
    // { name: 'Result', id: 'result', selector: (row) => row.result, cell: (row) => row.result || '–', minWidth: '80px' },
    { name: 'Status', id: 'status', cell: (row) => <Badge variant={statusVariant(row.status)}>{row.status || '–'}</Badge>, minWidth: '80px' },
    { name: 'P/L', id: 'profitOrLoss', cell: (row) => {
      const v = row.profitOrLoss
      const n = Number(v)
      const cls = n >= 0 ? 'text-teal-600' : 'text-red-600'
      return <span className={cls}>{formatInr(v)}</span>
    }, minWidth: '90px' },
    { name: 'Balance at Bet', id: 'balanceAtBet', cell: (row) => formatInr(row.balanceAtBet), minWidth: '110px' },
    { name: 'Balance After', id: 'balanceAfter', cell: (row) => formatInr(row.balanceAfter), minWidth: '110px' },
    // { name: 'Round ID', id: 'providerRoundId', selector: (row) => row.providerRoundId, cell: (row) => (row.providerRoundId || '–').slice(0, 12), minWidth: '100px' },
    { name: 'Bet At', id: 'betAt', cell: (row) => formatDateTime(row.betAt), minWidth: '130px' },
    // { name: 'Settled At', id: 'settledAt', cell: (row) => formatDateTime(row.settledAt), minWidth: '130px' },
  ]

  const filterComponent = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="User (name, mobile, email, UUID)"
          className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none w-48 sm:w-56"
        />
      </div>
      <input
        type="text"
        value={gameCode}
        onChange={(e) => setGameCode(e.target.value)}
        placeholder="Game code"
        className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none w-28"
      />
      <input
        type="text"
        value={providerCode}
        onChange={(e) => setProviderCode(e.target.value)}
        placeholder="Provider"
        className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none w-28"
      />
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        placeholder="From"
        className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none w-36"
      />
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="To"
        className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none w-36"
      />
      <button
        type="button"
        onClick={() => { setPage(1); fetchHistory(); }}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        aria-label="Refresh"
      >
        <HiRefresh className="w-4 h-4" /> Refresh
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageBanner title="Games History" subtitle="Casino game rounds with filters" showLive={false} icon={HiTicket} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          title="Casino Game History"
          columns={columns}
          data={list}
          searchable={false}
          filterComponent={filterComponent}
          pagination={true}
          paginationServer={true}
          paginationTotalRows={pagination.total}
          paginationPerPage={limit}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          onChangePage={(newPage) => setPage(newPage)}
          onChangeRowsPerPage={(newLimit, newPage) => {
            setLimit(newLimit)
            setPage(newPage ?? 1)
          }}
          progressPending={loading}
          noDataComponent={error ? <div className="py-12 text-center text-red-600">{error}</div> : undefined}
        />
      </div>
    </div>
  )
}
