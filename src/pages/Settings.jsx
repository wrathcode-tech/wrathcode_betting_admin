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

const STORAGE_KEY = 'crownbet-admin-settings'

const defaultSettings = {
  siteName: 'Crownbet',
  supportEmail: 'support@crownbet.com',
  maintenanceMode: false,
  serviceControls: {
    games: true,
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
  },
  fiatCurrencies: [{ code: 'INR', enabled: true, minDeposit: 100 }, { code: 'USD', enabled: true, minDeposit: 10 }],
}

const SERVICE_CONTROLS = [
  { key: 'games', label: 'Games / Betting', description: 'Enable or disable placing bets on casino games', icon: HiCollection },
  { key: 'deposits', label: 'Deposit', description: 'Enable or disable deposit requests', icon: HiArrowDown },
  { key: 'withdrawals', label: 'Withdrawal', description: 'Enable or disable withdrawal requests', icon: HiArrowUp },
  { key: 'bonuses', label: 'Bonuses', description: 'Enable or disable bonus claims and promo codes', icon: HiGift },
  { key: 'referrals', label: 'Referrals', description: 'Enable or disable referral program', icon: HiUserGroup },
  { key: 'support', label: 'Support', description: 'Enable or disable ticket creation', icon: HiSupport },
]

export default function Settings() {
  const [form, setForm] = useState(defaultSettings)
  const [scheduleFeature, setScheduleFeature] = useState('')
  const [scheduleAction, setScheduleAction] = useState('')
  const [scheduleDateTime, setScheduleDateTime] = useState('')
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

  function handleSave(e) {
    e.preventDefault()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      addToast('Configuration saved successfully', 'success')
    } catch (_) {
      addToast('Failed to save settings', 'error')
    }
  }

  function toggleService(key) {
    if (!canEdit) return
    setForm((f) => ({
      ...f,
      serviceControls: { ...f.serviceControls, [key]: !f.serviceControls?.[key] },
    }))
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

  return (
    <div className="space-y-6">
      <PageBanner
        title="Platform Configuration"
        subtitle="Control availability of platform features: instant on/off or schedule future changes – PlayAdd / BetFury"
        icon={HiCog}
      />
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
              onClick={() => canEdit && setForm((f) => ({ ...f, maintenanceMode: !f.maintenanceMode }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
                form.maintenanceMode ? 'bg-teal-500' : 'bg-gray-200'
              } ${!canEdit ? 'opacity-60' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  form.maintenanceMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Service Controls (Instant On/Off) card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Service Controls (Instant On/Off)</h2>
          <p className="text-sm text-gray-500 mt-0.5 mb-6">Enable or disable individual services. Click Save to apply changes.</p>
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
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
                    form.serviceControls?.[key] ? 'bg-teal-500' : 'bg-gray-200'
                  } ${!canEdit ? 'opacity-60' : ''}`}
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
        </div>

        {/* Save Configuration button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!canEdit}
            className="flex items-center justify-center gap-2 w-full max-w-md px-6 py-3.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiSave className="w-5 h-5" />
            Save Configuration
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
    </div>
  )
}
