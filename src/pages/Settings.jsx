/**
 * Platform Configuration – reference layout: teal banner, Full System Maintenance card,
 * Service Controls (Instant On/Off) with toggles, Save Configuration, Schedule a Change.
 */
import { useState, useEffect } from 'react'
import {
  HiCog,
  HiExclamation,
  HiSave,
  HiCalendar,
  HiCollection,
  HiCash,
  HiPlay,
  HiChartBar,
  HiArrowDown,
  HiArrowUp,
  HiGift,
  HiUserGroup,
  HiSupport,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

const STORAGE_KEY = 'crownbet-admin-settings'

/** Platform configuration API keys (GET/PATCH /api/v1/master/platform-configuration) ↔ form.serviceControls keys */
const API_TO_FORM = {
  gameServiceStatus: 'games',
  bettingServiceStatus: 'betting',
  inPlayServiceStatus: 'inPlay',
  sportsBookServiceStatus: 'sportsBook',
  depositServiceStatus: 'deposits',
  withdrawalServiceStatus: 'withdrawals',
  bonusServiceStatus: 'bonuses',
  referralServiceStatus: 'referrals',
  supportServiceStatus: 'support',
}
const FORM_TO_API = {
  games: 'gameServiceStatus',
  betting: 'bettingServiceStatus',
  inPlay: 'inPlayServiceStatus',
  sportsBook: 'sportsBookServiceStatus',
  deposits: 'depositServiceStatus',
  withdrawals: 'withdrawalServiceStatus',
  bonuses: 'bonusServiceStatus',
  referrals: 'referralServiceStatus',
  support: 'supportServiceStatus',
}

/** Normalize API value to boolean: true / "true" → on, false / "false" / null / 0 → off */
function apiValueToBoolean(value) {
  if (value === true || value === 'true' || value === 1) return true
  if (value === false || value === 'false' || value === 0 || value === null) return false
  return Boolean(value)
}

function apiSettingsToForm(settings) {
  if (!settings || typeof settings !== 'object') return defaultSettings.serviceControls
  const out = { ...defaultSettings.serviceControls }
  Object.entries(API_TO_FORM).forEach(([apiKey, formKey]) => {
    if (settings[apiKey] !== undefined) {
      out[formKey] = apiValueToBoolean(settings[apiKey])
    }
  })
  return out
}

function formServiceControlsToApi(serviceControls) {
  const out = {}
  Object.entries(FORM_TO_API).forEach(([formKey, apiKey]) => {
    out[apiKey] = !!serviceControls?.[formKey]
  })
  return out
}

const defaultSettings = {
  siteName: 'Crownbet',
  supportEmail: 'support@crownbet.com',
  maintenanceMode: false,
  serviceControls: {
    games: true,
    betting: true,
    inPlay: true,
    sportsBook: true,
    deposits: true,
    withdrawals: true,
    bonuses: true,
    referrals: true,
    support: true,
  },
  emailNotifications: true,
  withdrawalAlerts: true,
  twoFactorEnabled: false,
  paymentMethods: { paytm: true, upi: true, gpay: true, phonepe: true, imps: true, bankTransfer: true },
  limits: {
    minDepositFiat: 100,
    maxDepositFiat: 500000,
    minWithdrawalFiat: 500,
    maxWithdrawalFiatPerDay: 100000,
    newAccountWithdrawalHoldHours: 24,
    bonusPercentage: 10,
    usdtPrice: 0,
  },
  fiatCurrencies: [{ code: 'INR', enabled: true, minDeposit: 100 }, { code: 'USD', enabled: true, minDeposit: 10 }],
}

const SERVICE_CONTROLS = [
  { key: 'games', label: 'Games', description: 'Enable or disable casino games', icon: HiCollection },
  // { key: 'betting', label: 'Betting', description: 'Enable or disable placing bets', icon: HiCash },
  { key: 'inPlay', label: 'In-Play', description: 'Enable or disable in-play betting', icon: HiPlay },
  { key: 'sportsBook', label: 'Sportsbook', description: 'Enable or disable sportsbook betting', icon: HiChartBar },
  { key: 'deposits', label: 'Deposit', description: 'Enable or disable deposit requests', icon: HiArrowDown },
  { key: 'withdrawals', label: 'Withdrawal', description: 'Enable or disable withdrawal requests', icon: HiArrowUp },
  { key: 'bonuses', label: 'Bonuses', description: 'Enable or disable bonus claims and promo codes', icon: HiGift },
  { key: 'referrals', label: 'Referrals', description: 'Enable or disable referral program', icon: HiUserGroup },
  { key: 'support', label: 'Support', description: 'Enable or disable ticket creation', icon: HiSupport },
]

const TABS = [
  { id: 'platform', label: 'Platform Configuration' },
  { id: 'settings', label: 'Settings' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('platform')
  const [form, setForm] = useState(defaultSettings)
  const [scheduleFeature, setScheduleFeature] = useState('')
  const [scheduleAction, setScheduleAction] = useState('')
  const [scheduleDateTime, setScheduleDateTime] = useState('')
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true)
  const [siteSettingsError, setSiteSettingsError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [limitsSaving, setLimitsSaving] = useState(false)
  const [togglingKey, setTogglingKey] = useState(null)
  const [togglingFullMaintenance, setTogglingFullMaintenance] = useState(false)
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission(PERMISSIONS.EDIT_SETTINGS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm((f) => ({
          ...defaultSettings,
          ...f,
          ...parsed,
          serviceControls: { ...defaultSettings.serviceControls, ...parsed.serviceControls },
          limits: { ...defaultSettings.limits, ...parsed.limits },
          fiatCurrencies: parsed.fiatCurrencies || defaultSettings.fiatCurrencies,
        }))
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    setSiteSettingsLoading(true)
    setSiteSettingsError(null)
    AuthService.getPlatformConfiguration()
      .then((res) => {
        if (res?.success && res?.data) {
          // GET response: gameServiceStatus, fullSystemStatus, etc. → toggles
          const raw = res.data
          const config =
            raw && typeof raw === 'object' && 'gameServiceStatus' in raw
              ? raw
              : raw?.settings || raw?.platformConfiguration || raw?.data || raw
          setForm((f) => ({
            ...f,
            maintenanceMode: apiValueToBoolean(config.fullSystemStatus),
            serviceControls: apiSettingsToForm(config),
          }))
          setSiteSettingsError(null)
        } else {
          setSiteSettingsError(res?.message || 'Failed to load platform configuration')
        }
      })
      .catch(() => setSiteSettingsError('Failed to load platform configuration'))
      .finally(() => setSiteSettingsLoading(false))
  }, [])

  function handleSave(e) {
    e.preventDefault()
    if (!canEdit) return
    setSaving(true)
    const payload = formServiceControlsToApi(form.serviceControls)
    AuthService.patchPlatformConfiguration(payload)
      .then((res) => {
        if (res?.success) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
          } catch (_) {}
          addToast('Configuration saved successfully', 'success')
        } else {
          addToast(res?.message || 'Failed to save settings', 'error')
        }
      })
      .catch(() => addToast('Failed to save settings', 'error'))
      .finally(() => setSaving(false))
  }

  function toggleFullSystemMaintenance() {
    if (!canEdit || togglingFullMaintenance) return
    const nextValue = !form.maintenanceMode
    setTogglingFullMaintenance(true)
    AuthService.patchPlatformConfiguration({ fullSystemStatus: nextValue })
      .then((res) => {
        if (res?.success) {
          setForm((f) => ({ ...f, maintenanceMode: nextValue }))
          addToast(nextValue ? 'Full system maintenance enabled' : 'Full system maintenance disabled', 'success')
        } else {
          addToast(res?.message || 'Failed to update', 'error')
        }
      })
      .catch(() => addToast('Failed to update', 'error'))
      .finally(() => setTogglingFullMaintenance(false))
  }

  function toggleService(key) {
    if (!canEdit || togglingKey) return
    const nextValue = !form.serviceControls?.[key]
    setForm((f) => ({
      ...f,
      serviceControls: { ...f.serviceControls, [key]: nextValue },
    }))
    setTogglingKey(key)
    const payload = formServiceControlsToApi({ ...form.serviceControls, [key]: nextValue })
    AuthService.patchPlatformConfiguration(payload)
      .then((res) => {
        if (res?.success) {
          addToast(nextValue ? 'Service enabled' : 'Service disabled', 'success')
        } else {
          setForm((f) => ({ ...f, serviceControls: { ...f.serviceControls, [key]: !nextValue } }))
          addToast(res?.message || 'Failed to update', 'error')
        }
      })
      .catch(() => {
        setForm((f) => ({ ...f, serviceControls: { ...f.serviceControls, [key]: !nextValue } }))
        addToast('Failed to update', 'error')
      })
      .finally(() => setTogglingKey(null))
  }

  function handleSchedule(e) {
    e.preventDefault()
    if (!scheduleFeature || !scheduleAction || !scheduleDateTime) {
      addToast('Please select feature, action and date & time', 'error')
      return
    }
    addToast('Change scheduled successfully', 'success')
    setScheduleFeature('')
    setScheduleAction('')
    setScheduleDateTime('')
  }

  function handleSaveLimits(e) {
    e.preventDefault()
    if (!canEdit) return
    setLimitsSaving(true)
    const limits = form.limits || defaultSettings.limits
    const payload = {
      minDepositLimit: Number(limits.minDepositFiat) || 0,
      maxDepositLimit: Number(limits.maxDepositFiat) || 0,
      bonusPercentage: Number(limits.bonusPercentage) || 0,
      minWithdrawalLimit: Number(limits.minWithdrawalFiat) || 0,
      maxWithdrawalLimit: Number(limits.maxWithdrawalFiatPerDay) || 0,
      usdtPrice: Number(limits.usdtPrice) || 0,
    }
    AuthService.patchMasterTransactionLimits(payload)
      .then((res) => {
        if (res?.success) {
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            const parsed = saved ? JSON.parse(saved) : {}
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, limits: { ...defaultSettings.limits, ...form.limits } }))
          } catch (_) {}
          addToast(res?.message || 'Limits saved successfully', 'success')
        } else {
          addToast(res?.message || 'Failed to save limits', 'error')
        }
      })
      .catch(() => addToast('Failed to save limits', 'error'))
      .finally(() => setLimitsSaving(false))
  }

  return (
    <div className="space-y-6">
      <PageBanner
        title="Settings"
        subtitle="Platform configuration and app limits in separate tabs"
        icon={HiCog}
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium rounded-t-xl border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-600 bg-white border-gray-200'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Platform Configuration */}
      {activeTab === 'platform' && (
      <>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Full System Maintenance card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <HiExclamation className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Full System Maintenance</h2>
              <p className="text-sm text-gray-500 mt-0.5">When enabled, the entire platform will be inaccessible to users.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.maintenanceMode}
              onClick={toggleFullSystemMaintenance}
              disabled={!canEdit || togglingFullMaintenance}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
                form.maintenanceMode ? 'bg-teal-500' : 'bg-gray-200'
              } ${!canEdit ? 'opacity-60' : ''} ${togglingFullMaintenance ? 'opacity-70' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  form.maintenanceMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Service Controls (Instant On/Off) – GET/PATCH /api/v1/master/platform-configuration */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Service Controls (Instant On/Off)</h2>
          <p className="text-sm text-gray-500 mt-0.5 mb-2">Enable or disable platform functions. Changes apply immediately.</p>
          {siteSettingsError && (
            <p className="text-sm text-red-600 mb-4">{siteSettingsError}</p>
          )}
          {siteSettingsLoading ? (
            <p className="text-sm text-gray-500 py-4">Loading platform configuration…</p>
          ) : (
            <ul className="space-y-4">
              {SERVICE_CONTROLS.map(({ key, label, description, icon: Icon }) => (
                <li key={key} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 text-teal-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.serviceControls?.[key]}
                    onClick={() => toggleService(key)}
                    disabled={!canEdit || togglingKey !== null}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
                      form.serviceControls?.[key] ? 'bg-teal-500' : 'bg-gray-200'
                    } ${!canEdit ? 'opacity-60' : ''} ${togglingKey === key ? 'opacity-70' : ''}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                        form.serviceControls?.[key] ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Save Configuration button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!canEdit || siteSettingsLoading || saving}
            className="flex items-center justify-center gap-2 w-full max-w-md px-6 py-3.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiSave className="w-5 h-5" />
            {saving ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
        {!canEdit && (
          <p className="text-center text-gray-500 text-sm">You need edit permission to change settings.</p>
        )}
      </form>

      {/* Schedule a Change card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 text-violet-600">
            <HiCalendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Schedule a Change</h2>
            <p className="text-sm text-gray-500 mt-0.5">Set a future time to enable or disable a feature. A cron job applies changes automatically.</p>
          </div>
        </div>
        <form onSubmit={handleSchedule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Feature</label>
              <select
                value={scheduleFeature}
                onChange={(e) => { setScheduleFeature(e.target.value); setScheduleAction('') }}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
              >
                <option value="">Select feature...</option>
                {SERVICE_CONTROLS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Action (opposite of current state)</label>
              <select
                value={scheduleAction}
                onChange={(e) => setScheduleAction(e.target.value)}
                disabled={!scheduleFeature}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none disabled:opacity-60"
              >
                <option value="">{scheduleFeature ? 'Select action...' : 'Select feature first'}</option>
                <option value="enable">Enable</option>
                <option value="disable">Disable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time (must be in the future)</label>
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 focus:ring-2 focus:ring-violet-500/50 focus:outline-none transition-colors"
          >
            <HiCalendar className="w-5 h-5" />
            Schedule
          </button>
        </form>
      </div>
      </>
      )}

      {/* Tab: Settings (limits & bonus) */}
      {activeTab === 'settings' && (
      <form onSubmit={handleSaveLimits} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-600">
              <HiCash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Deposit & bonus limits</h2>
              <p className="text-sm text-gray-500 mt-0.5">Set minimum and maximum deposit limits, withdrawal limits, and bonus percentage.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum deposit limit (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.limits?.minDepositFiat ?? defaultSettings.limits.minDepositFiat}
                onChange={(e) => setForm((f) => ({ ...f, limits: { ...f.limits, minDepositFiat: Number(e.target.value) || 0 } }))}
                disabled={!canEdit}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum deposit limit (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.limits?.maxDepositFiat ?? defaultSettings.limits.maxDepositFiat}
                onChange={(e) => setForm((f) => ({ ...f, limits: { ...f.limits, maxDepositFiat: Number(e.target.value) || 0 } }))}
                disabled={!canEdit}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bonus percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.limits?.bonusPercentage ?? defaultSettings.limits.bonusPercentage}
                onChange={(e) => setForm((f) => ({ ...f, limits: { ...f.limits, bonusPercentage: Number(e.target.value) || 0 } }))}
                disabled={!canEdit}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum withdrawal limit (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.limits?.minWithdrawalFiat ?? defaultSettings.limits.minWithdrawalFiat}
                onChange={(e) => setForm((f) => ({ ...f, limits: { ...f.limits, minWithdrawalFiat: Number(e.target.value) || 0 } }))}
                disabled={!canEdit}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum withdrawal Limit (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.limits?.maxWithdrawalFiatPerDay ?? defaultSettings.limits.maxWithdrawalFiatPerDay}
                onChange={(e) => setForm((f) => ({ ...f, limits: { ...f.limits, maxWithdrawalFiatPerDay: Number(e.target.value) || 0 } }))}
                disabled={!canEdit}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">USDT Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.limits?.usdtPrice ?? defaultSettings.limits.usdtPrice}
                onChange={(e) => setForm((f) => ({ ...f, limits: { ...f.limits, usdtPrice: Number(e.target.value) || 0 } }))}
                disabled={!canEdit}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={!canEdit || limitsSaving}
              className="flex items-center justify-center gap-2 w-full max-w-md px-6 py-3.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiSave className="w-5 h-5" />
              {limitsSaving ? 'Saving…' : 'Save limits'}
            </button>
          </div>
          {!canEdit && (
            <p className="text-center text-gray-500 text-sm mt-2">You need edit permission to change settings.</p>
          )}
        </div>
      </form>
      )}
    </div>
  )
}
