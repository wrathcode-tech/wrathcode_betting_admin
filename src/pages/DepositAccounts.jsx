/**
 * Deposit Accounts – Bank & UPI accounts for receiving deposits.
 * GET/POST /api/v1/master/deposit-account, PUT /:id, PATCH /status/:id, DELETE /:id
 */
import { useState, useEffect, useCallback } from 'react'
import {
  HiCreditCard,
  HiPlus,
  HiPencil,
  HiTrash,
  HiRefresh,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Badge from '../components/ui/Badge'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

const OWNER_OPTIONS = [
  { value: '', label: 'All owners' },
  { value: 'master', label: 'Master' },
  { value: 'branch', label: 'Branch' },
]
const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'bank', label: 'Bank' },
  { value: 'upi', label: 'UPI' },
  { value: 'crypto', label: 'Crypto' },
]
const IS_ACTIVE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

const defaultForm = {
  type: 'bank',
  ownerType: 'master',
  branchId: '',
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
  upiName: '',
  qrImage: '',
  cryptoAddress: '',
  cryptoChain: '',
  minDeposit: '',
  maxDeposit: '',
  displayOrder: '',
}

function buildPayload(form) {
  const payload = {
    type: form.type,
    ownerType: form.ownerType,
  }
  if (form.branchId?.trim()) payload.branchId = form.branchId.trim()
  if (form.type === 'bank') {
    payload.bankName = form.bankName?.trim() || ''
    payload.accountHolderName = form.accountHolderName?.trim() || ''
    payload.accountNumber = form.accountNumber?.trim() || ''
    payload.ifscCode = form.ifscCode?.trim() || ''
  } else if (form.type === 'crypto') {
    payload.cryptoAddress = form.cryptoAddress?.trim() || ''
    payload.cryptoChain = form.cryptoChain?.trim() || ''
    if (form.minDeposit !== '' && form.minDeposit != null) payload.minDeposit = Number(form.minDeposit) || 0
    if (form.maxDeposit !== '' && form.maxDeposit != null) payload.maxDeposit = Number(form.maxDeposit) || 0
  } else {
    payload.upiId = form.upiId?.trim() || ''
    payload.upiName = form.upiName?.trim() || ''
    if (form.qrImage?.trim()) payload.qrImage = form.qrImage.trim()
    if (form.minDeposit !== '' && form.minDeposit != null) payload.minDeposit = Number(form.minDeposit) || 0
    if (form.maxDeposit !== '' && form.maxDeposit != null) payload.maxDeposit = Number(form.maxDeposit) || 0
  }
  if (form.displayOrder !== '' && form.displayOrder != null && !isNaN(Number(form.displayOrder))) {
    payload.displayOrder = Number(form.displayOrder)
  }
  return payload
}

function accountToForm(acc) {
  if (!acc) return { ...defaultForm }
  return {
    ...defaultForm,
    type: acc.type || 'bank',
    ownerType: acc.ownerType || 'master',
    branchId: acc.branchId ?? '',
    bankName: acc.bankName ?? '',
    accountHolderName: acc.accountHolderName ?? '',
    accountNumber: acc.accountNumber ?? '',
    ifscCode: acc.ifscCode ?? '',
    upiId: acc.upiId ?? '',
    upiName: acc.upiName ?? '',
    qrImage: acc.qrImage ?? '',
    cryptoAddress: acc.cryptoAddress ?? '',
    cryptoChain: acc.cryptoChain ?? '',
    minDeposit: acc.minDeposit != null ? String(acc.minDeposit) : '',
    maxDeposit: acc.maxDeposit != null ? String(acc.maxDeposit) : '',
    displayOrder: acc.displayOrder != null ? String(acc.displayOrder) : '',
  }
}

export default function DepositAccounts() {
  const [accounts, setAccounts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [ownerType, setOwnerType] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [statusLoadingId, setStatusLoadingId] = useState(null)
  const [viewAccount, setViewAccount] = useState(null)
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission(PERMISSIONS.VIEW_DEPOSITS)

  const fetchAccounts = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = { page, limit }
    if (ownerType) params.ownerType = ownerType
    if (typeFilter) params.type = typeFilter
    if (isActiveFilter !== '') params.isActive = isActiveFilter
    AuthService.getMasterDepositAccounts(params)
      .then((res) => {
        if (res?.success && res?.data) {
          setAccounts(res.data.accounts || [])
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setAccounts([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(res?.message || 'Failed to load deposit accounts')
        }
      })
      .catch(() => {
        setAccounts([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        setError('Failed to load deposit accounts')
      })
      .finally(() => setLoading(false))
  }, [page, limit, ownerType, typeFilter, isActiveFilter])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    setPage(1)
  }, [ownerType, typeFilter, isActiveFilter])

  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)
  const total = pagination.total

  const openAdd = () => {
    setForm(defaultForm)
    setAddOpen(true)
  }

  const openEdit = (acc) => {
    setSelectedAccount(acc)
    setForm(accountToForm(acc))
    setEditOpen(true)
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (form.type === 'bank' && (!form.bankName?.trim() || !form.accountHolderName?.trim() || !form.accountNumber?.trim() || !form.ifscCode?.trim())) {
      addToast('Fill all bank fields', 'error')
      return
    }
    if (form.type === 'upi' && (!form.upiId?.trim() || !form.upiName?.trim())) {
      addToast('Fill UPI ID and UPI Name', 'error')
      return
    }
    if (form.type === 'crypto' && !form.cryptoAddress?.trim()) {
      addToast('Fill crypto address', 'error')
      return
    }
    setSubmitLoading(true)
    AuthService.postMasterDepositAccount(buildPayload(form))
      .then((res) => {
        if (res?.success) {
          addToast(res?.message || 'Deposit account added', 'success')
          setAddOpen(false)
          setForm(defaultForm)
          fetchAccounts()
        } else {
          addToast(res?.message || 'Failed to add account', 'error')
        }
      })
      .catch(() => addToast('Failed to add account', 'error'))
      .finally(() => setSubmitLoading(false))
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!selectedAccount?._id) return
    if (form.type === 'bank' && (!form.bankName?.trim() || !form.accountHolderName?.trim() || !form.accountNumber?.trim() || !form.ifscCode?.trim())) {
      addToast('Fill all bank fields', 'error')
      return
    }
    if (form.type === 'upi' && (!form.upiId?.trim() || !form.upiName?.trim())) {
      addToast('Fill UPI ID and UPI Name', 'error')
      return
    }
    if (form.type === 'crypto' && !form.cryptoAddress?.trim()) {
      addToast('Fill crypto address', 'error')
      return
    }
    setSubmitLoading(true)
    AuthService.putMasterDepositAccount(selectedAccount._id, buildPayload(form))
      .then((res) => {
        if (res?.success && res?.data?.account) {
          setAccounts((prev) => prev.map((a) => (a._id === selectedAccount._id ? res.data.account : a)))
          addToast(res?.message || 'Deposit account updated', 'success')
          setEditOpen(false)
          setSelectedAccount(null)
        } else {
          addToast(res?.message || 'Failed to update account', 'error')
        }
      })
      .catch(() => addToast('Failed to update account', 'error'))
      .finally(() => setSubmitLoading(false))
  }

  const handleToggleStatus = (acc) => {
    if (!acc?._id) return
    setStatusLoadingId(acc._id)
    const nextActive = !acc.isActive
    AuthService.patchMasterDepositAccountStatus(acc._id, nextActive)
      .then((res) => {
        if (res?.success && res?.data?.account) {
          setAccounts((prev) => prev.map((a) => (a._id === acc._id ? res.data.account : a)))
          addToast(res?.message || 'Status updated', 'success')
        } else {
          addToast(res?.message || 'Failed to update status', 'error')
        }
      })
      .catch(() => addToast('Failed to update status', 'error'))
      .finally(() => setStatusLoadingId(null))
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirm?.id) return
    setSubmitLoading(true)
    AuthService.deleteMasterDepositAccount(deleteConfirm.id)
      .then((res) => {
        if (res?.success !== false) {
          addToast(res?.message || 'Deposit account deleted', 'success')
          setDeleteConfirm(null)
          fetchAccounts()
        } else {
          addToast(res?.message || 'Failed to delete', 'error')
        }
      })
      .catch(() => addToast('Failed to delete', 'error'))
      .finally(() => setSubmitLoading(false))
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'

  return (
    <div className="space-y-6">
      <PageBanner title="Deposit Accounts" subtitle="Bank, UPI & Crypto accounts for receiving deposits" icon={HiCreditCard} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiCreditCard className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-800">Bank, UPI & Crypto List</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{loading ? '…' : `${total} accounts`}</span>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors"
          >
            <HiPlus className="w-5 h-5" /> Add Account
          </button>
          <button type="button" onClick={fetchAccounts} disabled={loading} className="p-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50" title="Refresh">
            <HiRefresh className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={ownerType} onChange={(e) => setOwnerType(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none">
          {OWNER_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none">
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={isActiveFilter} onChange={(e) => setIsActiveFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none">
          {IS_ACTIVE_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none">
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Table – only account number, account holder name, owner type + View/Actions */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account holder name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account number</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">Loading…</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-red-600 text-sm">{error}</td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">No deposit accounts found.</td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${acc.type === 'upi' ? 'bg-violet-100 text-violet-700' : acc.type === 'crypto' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                        {acc.type === 'upi' ? 'UPI' : acc.type === 'crypto' ? 'Crypto' : 'Bank'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{acc.ownerType || '–'}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {acc.type === 'bank' ? (acc.accountHolderName || '–') : acc.type === 'crypto' ? (acc.cryptoChain || '–') : (acc.upiName || '–')}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 font-mono">
                      {acc.type === 'bank' ? (acc.accountNumber ? `****${String(acc.accountNumber).slice(-4)}` : '–') : acc.type === 'crypto' ? (acc.cryptoAddress ? `${String(acc.cryptoAddress).slice(0, 10)}...${String(acc.cryptoAddress).slice(-8)}` : '–') : (acc.upiId || '–')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewAccount(acc)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                          title="View all details"
                        >
                          <HiEye className="w-4 h-4" /> View
                        </button>
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(acc)}
                              disabled={statusLoadingId === acc._id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${acc.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} disabled:opacity-50`}
                            >
                              {statusLoadingId === acc._id ? '…' : acc.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button type="button" onClick={() => openEdit(acc)} className="p-2 rounded-lg text-teal-600 hover:bg-teal-50" title="Edit">
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setDeleteConfirm({ id: acc._id, name: acc.bankName || acc.upiId || acc.cryptoAddress || acc._id })} className="p-2 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && accounts.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Page {currentPage} of {totalPages} ({total} total)</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                <HiChevronLeft className="w-4 h-4 inline mr-1" /> Prev
              </button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                Next <HiChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && accounts.length === 0 && (
        <EmptyState title="No deposit accounts" message="Add a bank or UPI account to receive deposits." action={<button type="button" onClick={openAdd} className="px-4 py-2 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600">Add Account</button>} />
      )}

      {/* View details modal */}
      <Modal open={!!viewAccount} onClose={() => setViewAccount(null)} title="Deposit account details" size="lg" scrollable>
        {viewAccount && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 block mb-0.5">Type</span><span className="font-medium text-gray-900">{viewAccount.type === 'upi' ? 'UPI' : viewAccount.type === 'crypto' ? 'Crypto' : 'Bank'}</span></div>
              <div><span className="text-gray-500 block mb-0.5">Owner type</span><span className="font-medium text-gray-900">{viewAccount.ownerType || '–'}</span></div>
              {viewAccount.branchId != null && viewAccount.branchId !== '' && (
                <div className="sm:col-span-2"><span className="text-gray-500 block mb-0.5">Branch ID</span><span className="font-medium text-gray-900">{viewAccount.branchId}</span></div>
              )}
              <div><span className="text-gray-500 block mb-0.5">Status</span><Badge variant={viewAccount.isActive ? 'success' : 'neutral'}>{viewAccount.isActive ? 'Active' : 'Inactive'}</Badge></div>
             
            </div>
            {viewAccount.type === 'bank' ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank details</h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><dt className="text-gray-500">Bank name</dt><dd className="font-medium text-gray-900">{viewAccount.bankName || '–'}</dd></div>
                  <div><dt className="text-gray-500">Account holder name</dt><dd className="font-medium text-gray-900">{viewAccount.accountHolderName || '–'}</dd></div>
                  <div><dt className="text-gray-500">Account number</dt><dd className="font-mono text-gray-900">{viewAccount.accountNumber || '–'}</dd></div>
                  <div><dt className="text-gray-500">IFSC code</dt><dd className="font-mono text-gray-900">{viewAccount.ifscCode || '–'}</dd></div>
                </dl>
              </div>
            ) : viewAccount.type === 'crypto' ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Crypto details</h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="sm:col-span-2"><dt className="text-gray-500">Address</dt><dd className="font-mono text-gray-900 break-all">{viewAccount.cryptoAddress || '–'}</dd></div>
                  <div><dt className="text-gray-500">Chain</dt><dd className="font-medium text-gray-900">{viewAccount.cryptoChain || '–'}</dd></div>
                  {viewAccount.minDeposit != null && <div><dt className="text-gray-500">Min deposit</dt><dd className="text-gray-900">₹{Number(viewAccount.minDeposit).toLocaleString('en-IN')}</dd></div>}
                  {viewAccount.maxDeposit != null && <div><dt className="text-gray-500">Max deposit</dt><dd className="text-gray-900">₹{Number(viewAccount.maxDeposit).toLocaleString('en-IN')}</dd></div>}
                </dl>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">UPI details</h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><dt className="text-gray-500">UPI ID</dt><dd className="font-medium text-gray-900">{viewAccount.upiId || '–'}</dd></div>
                  <div><dt className="text-gray-500">UPI name</dt><dd className="font-medium text-gray-900">{viewAccount.upiName || '–'}</dd></div>
                  {viewAccount.minDeposit != null && <div><dt className="text-gray-500">Min deposit</dt><dd className="text-gray-900">₹{Number(viewAccount.minDeposit).toLocaleString('en-IN')}</dd></div>}
                  {viewAccount.maxDeposit != null && <div><dt className="text-gray-500">Max deposit</dt><dd className="text-gray-900">₹{Number(viewAccount.maxDeposit).toLocaleString('en-IN')}</dd></div>}
                  {viewAccount.qrImage && (
                    <div className="sm:col-span-2">
                      <dt className="text-gray-500 mb-1">QR image</dt>
                      <dd><img src={viewAccount.qrImage} alt="UPI QR" className="max-w-[180px] h-auto rounded-lg border border-gray-200" /></dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
            <div className="flex justify-end">
              <button type="button" onClick={() => setViewAccount(null)} className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Deposit Account" size="lg" scrollable>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputClass} disabled={submitLoading}>
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner type</label>
            <select value={form.ownerType} onChange={(e) => setForm((f) => ({ ...f, ownerType: e.target.value }))} className={inputClass} disabled={submitLoading}>
              <option value="master">Master</option>
              <option value="branch">Branch</option>
            </select>
          </div>
          {form.ownerType === 'branch' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch ID (optional)</label>
              <input type="text" value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))} className={inputClass} placeholder="Branch ID" disabled={submitLoading} />
            </div>
          )}
          {form.type === 'bank' ? (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Bank name</label><input type="text" value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Account holder name</label><input type="text" value={form.accountHolderName} onChange={(e) => setForm((f) => ({ ...f, accountHolderName: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Account number</label><input type="text" value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">IFSC code</label><input type="text" value={form.ifscCode} onChange={(e) => setForm((f) => ({ ...f, ifscCode: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
            </>
          ) : form.type === 'crypto' ? (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Crypto address</label><input type="text" value={form.cryptoAddress} onChange={(e) => setForm((f) => ({ ...f, cryptoAddress: e.target.value }))} className={inputClass} placeholder="0x..." required disabled={submitLoading} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Chain (optional)</label><input type="text" value={form.cryptoChain} onChange={(e) => setForm((f) => ({ ...f, cryptoChain: e.target.value }))} className={inputClass} placeholder="e.g. BEP20, ERC20" disabled={submitLoading} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Min deposit</label><input type="number" min="0" value={form.minDeposit} onChange={(e) => setForm((f) => ({ ...f, minDeposit: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Max deposit</label><input type="number" min="0" value={form.maxDeposit} onChange={(e) => setForm((f) => ({ ...f, maxDeposit: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
              </div>
            </>
          ) : (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label><input type="text" value={form.upiId} onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))} className={inputClass} placeholder="user@paytm" required disabled={submitLoading} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">UPI name</label><input type="text" value={form.upiName} onChange={(e) => setForm((f) => ({ ...f, upiName: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">QR image URL (optional)</label><input type="text" value={form.qrImage} onChange={(e) => setForm((f) => ({ ...f, qrImage: e.target.value }))} className={inputClass} placeholder="https://..." disabled={submitLoading} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Min deposit</label><input type="number" min="0" value={form.minDeposit} onChange={(e) => setForm((f) => ({ ...f, minDeposit: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Max deposit</label><input type="number" min="0" value={form.maxDeposit} onChange={(e) => setForm((f) => ({ ...f, maxDeposit: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display order (optional)</label>
            <input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className={inputClass} placeholder="0" disabled={submitLoading} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300" disabled={submitLoading}>Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50" disabled={submitLoading}>{submitLoading ? 'Adding…' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelectedAccount(null); }} title="Edit Deposit Account" size="lg" scrollable>
        {selectedAccount && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputClass} disabled={submitLoading}>
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner type</label>
              <select value={form.ownerType} onChange={(e) => setForm((f) => ({ ...f, ownerType: e.target.value }))} className={inputClass} disabled={submitLoading}>
                <option value="master">Master</option>
                <option value="branch">Branch</option>
              </select>
            </div>
            {form.ownerType === 'branch' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch ID (optional)</label>
                <input type="text" value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))} className={inputClass} disabled={submitLoading} />
              </div>
            )}
            {form.type === 'bank' ? (
              <>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Bank name</label><input type="text" value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Account holder name</label><input type="text" value={form.accountHolderName} onChange={(e) => setForm((f) => ({ ...f, accountHolderName: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Account number</label><input type="text" value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">IFSC code</label><input type="text" value={form.ifscCode} onChange={(e) => setForm((f) => ({ ...f, ifscCode: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
              </>
            ) : form.type === 'crypto' ? (
              <>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Crypto address</label><input type="text" value={form.cryptoAddress} onChange={(e) => setForm((f) => ({ ...f, cryptoAddress: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Chain (optional)</label><input type="text" value={form.cryptoChain} onChange={(e) => setForm((f) => ({ ...f, cryptoChain: e.target.value }))} className={inputClass} placeholder="e.g. BEP20, ERC20" disabled={submitLoading} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Min deposit</label><input type="number" min="0" value={form.minDeposit} onChange={(e) => setForm((f) => ({ ...f, minDeposit: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Max deposit</label><input type="number" min="0" value={form.maxDeposit} onChange={(e) => setForm((f) => ({ ...f, maxDeposit: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
                </div>
              </>
            ) : (
              <>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label><input type="text" value={form.upiId} onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">UPI name</label><input type="text" value={form.upiName} onChange={(e) => setForm((f) => ({ ...f, upiName: e.target.value }))} className={inputClass} required disabled={submitLoading} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">QR image URL (optional)</label><input type="text" value={form.qrImage} onChange={(e) => setForm((f) => ({ ...f, qrImage: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Min deposit</label><input type="number" min="0" value={form.minDeposit} onChange={(e) => setForm((f) => ({ ...f, minDeposit: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Max deposit</label><input type="number" min="0" value={form.maxDeposit} onChange={(e) => setForm((f) => ({ ...f, maxDeposit: e.target.value }))} className={inputClass} disabled={submitLoading} /></div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display order (optional)</label>
              <input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className={inputClass} disabled={submitLoading} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEditOpen(false); setSelectedAccount(null); }} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300" disabled={submitLoading}>Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50" disabled={submitLoading}>{submitLoading ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete deposit account?"
        message={deleteConfirm ? `Remove "${deleteConfirm.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
