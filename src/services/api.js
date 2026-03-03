/**
 * Mock API service using Axios (frontend-only).
 * Simulates network delay and returns static/mock data.
 */

import axios from 'axios'
import {
  dashboardKpis,
  dailyActivityData,
  profitLossData,
  recentActivity,
  riskAlerts,
  usersData,
  userBets,
  depositsData,
  userLogins,
  userTransactions,
  withdrawalsData,
  userDeposits,
  userWithdrawals,
  userTickets,
  userReferralData,
  gamesData,
  bonusesData,
  bonusAnalytics,
  referralTree,
  referralPayouts,
  referrersList,
  referralStats,
  flaggedUsers,
  reportsPlData,
  reportsDepositWithdrawalData,
  reportsRevenueSummary,
  ticketsData,
  bannersData,
  announcementsData,
  staticPagesData,
  auditLogsData,
  settingsDefaults,
  notificationsList,
} from '../data/mockData'

const MOCK_DELAY_MS = 400

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Axios instance (optional: baseURL for future real API)
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Intercept requests and return mock data (no real network)
api.interceptors.request.use(async (config) => {
  await delay()
  return config
})

// Dashboard
export const getDashboardKpis = () => Promise.resolve({ data: dashboardKpis })
export const getDailyActivity = () => Promise.resolve({ data: dailyActivityData })
export const getProfitLoss = () => Promise.resolve({ data: profitLossData })
export const getRecentActivity = () => Promise.resolve({ data: recentActivity })
export const getRiskAlerts = () => Promise.resolve({ data: riskAlerts })

// Users
export const getUsers = (params = {}) => Promise.resolve({ data: usersData })
export const getUserById = (id) => Promise.resolve({ data: usersData.find((u) => u.id === Number(id)) || usersData[0] })
export const getUserBets = (userId) => Promise.resolve({ data: userBets(userId) })
export const getUserLogins = (userId) => Promise.resolve({ data: userLogins(userId) })
export const getUserTransactions = (userId) => Promise.resolve({ data: userTransactions(userId) })
export const updateUser = (id, payload) => Promise.resolve({ data: { ...usersData.find((u) => u.id === Number(id)), ...payload } })
export const freezeUser = (id) => Promise.resolve({ data: { ok: true } })
export const banUser = (id) => Promise.resolve({ data: { ok: true } })
export const creditDebitUser = (id, payload) => Promise.resolve({ data: { ok: true } })

// Wallet & Finance
export const getDeposits = () => Promise.resolve({ data: depositsData })
export const getWithdrawals = () => Promise.resolve({ data: withdrawalsData })
export const getDepositsByUser = (userId) => Promise.resolve({ data: userDeposits(userId) })
export const getWithdrawalsByUser = (userId) => Promise.resolve({ data: userWithdrawals(userId) })

/** Approve pending deposit: set status completed and credit user balance. amountOverride = amount to credit (default deposit.amount). */
export function approveDeposit(depositId, amountOverride) {
  const deposit = depositsData.find((d) => d.id === depositId)
  if (!deposit || deposit.status !== 'pending') return Promise.resolve({ data: { ok: false } })
  deposit.status = 'completed'
  const creditAmount = amountOverride != null && amountOverride !== '' ? Number(amountOverride) : Number(deposit.amount)
  if (!Number.isNaN(creditAmount) && creditAmount > 0) {
    const user = usersData.find((u) => u.id === deposit.userId)
    if (user) user.balanceFiat = (user.balanceFiat || 0) + creditAmount
  }
  return Promise.resolve({ data: { ok: true } })
}

/** Reject pending deposit: set status rejected and store reason (no balance change). */
export function rejectDeposit(depositId, reason) {
  const deposit = depositsData.find((d) => d.id === depositId)
  if (!deposit || deposit.status !== 'pending') return Promise.resolve({ data: { ok: false } })
  deposit.status = 'rejected'
  deposit.rejectReason = reason || 'Rejected by Admin'
  return Promise.resolve({ data: { ok: true } })
}

export const approveWithdrawal = (id) => Promise.resolve({ data: { ok: true } })
export const rejectWithdrawal = (id, reason) => Promise.resolve({ data: { ok: true } })

// Games
export const getGames = () => Promise.resolve({ data: gamesData })
export const updateGame = (id, payload) => Promise.resolve({ data: { ...gamesData.find((g) => g.id === Number(id)), ...payload } })

// Bonuses
export const getBonuses = () => Promise.resolve({ data: bonusesData })
export const getBonusAnalytics = () => Promise.resolve({ data: bonusAnalytics })
export const createBonus = (payload) => Promise.resolve({ data: { id: Date.now(), ...payload } })

// Referrals
export const getReferralTree = () => Promise.resolve({ data: referralTree })
export const getReferralPayouts = () => Promise.resolve({ data: referralPayouts })
export const getReferrers = () => Promise.resolve({ data: referrersList })
export const getReferralStats = () => Promise.resolve({ data: referralStats })

// Risk
export const getFlaggedUsers = () => Promise.resolve({ data: flaggedUsers })
export const setWithdrawalFrozen = (userId, frozen) => Promise.resolve({ data: { ok: true } })

// Reports
export const getReportsPl = (dateRange) => Promise.resolve({ data: reportsPlData })
export const getReportsDepositWithdrawal = (dateRange) => Promise.resolve({ data: reportsDepositWithdrawalData })
export const getReportsRevenueSummary = (dateRange) => Promise.resolve({ data: reportsRevenueSummary })

// Support
export const getTickets = () => Promise.resolve({ data: ticketsData })
export const getTicketById = (id) => Promise.resolve({ data: ticketsData[0] })
export const getTicketsByUser = (userId) => Promise.resolve({ data: userTickets(userId) })
export const getReferralByUser = (userId) => Promise.resolve({ data: userReferralData(userId) })
export const replyTicket = (id, message) => Promise.resolve({ data: { ok: true } })
export const addAdminNote = (id, note) => Promise.resolve({ data: { ok: true } })

// CMS
export const getBanners = () => Promise.resolve({ data: bannersData })
export const getAnnouncements = () => Promise.resolve({ data: announcementsData })
export const getStaticPages = () => Promise.resolve({ data: staticPagesData })
export const updateBanner = (id, payload) => Promise.resolve({ data: { ok: true } })
export const updateAnnouncement = (id, payload) => Promise.resolve({ data: { ok: true } })
export const updateStaticPage = (id, payload) => Promise.resolve({ data: { ok: true } })

// Notifications
export const getNotifications = () => Promise.resolve({ data: [...notificationsList] })
export const sendNotificationToUser = (userId, payload) => {
  const user = usersData.find((u) => u.id === Number(userId))
  return Promise.resolve({
    data: {
      id: Date.now(),
      userId: Number(userId),
      userName: user ? user.name : 'Unknown',
      userEmail: user ? user.email : '',
      title: payload.title || '',
      message: payload.message || '',
      link: payload.link || null,
      sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'active',
    },
  })
}
export const sendBulkNotification = (payload) => Promise.resolve({ data: { ok: true, count: payload.userIds?.length || 0 } })
export const sendAnnouncementToAll = (payload) => Promise.resolve({ data: { ok: true } })

// Audit
export const getAuditLogs = (filters = {}) => Promise.resolve({ data: auditLogsData })

// Settings
export const getSettings = () => Promise.resolve({ data: settingsDefaults })
export const saveSettings = (payload) => Promise.resolve({ data: payload })

export default api
