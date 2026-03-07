/**
 * Static mock data for enterprise Admin Panel (frontend-only).
 * Used by mock API service.
 */

// Dashboard KPIs & charts (INR only)
export const dashboardKpis = {
  totalUsers: 12847,
  totalBets: 48291,
  profit: 240000,
  deposits: 185000,
  withdrawals: 92000,
  changeUsers: 12,
  changeBets: 5,
  changeProfit: 18,
  changeDeposits: 8,
  changeWithdrawals: -3,
  // Extra counts for cards
  activeToday: 892,
  betsToday: 1240,
  depositsToday: 45000,
  pendingWithdrawals: 24,
  openTickets: 18,
}

export const dailyActivityData = [
  { date: 'Mon', users: 3200, bets: 6200, revenue: 32 },
  { date: 'Tue', users: 2800, bets: 5400, revenue: 28 },
  { date: 'Wed', users: 4100, bets: 7100, revenue: 45 },
  { date: 'Thu', users: 3500, bets: 6500, revenue: 38 },
  { date: 'Fri', users: 4800, bets: 8200, revenue: 52 },
  { date: 'Sat', users: 6200, bets: 9800, revenue: 68 },
  { date: 'Sun', users: 5300, bets: 8900, revenue: 58 },
]

// Profit/loss by category (INR) – used in Reports
export const profitLossData = [
  { name: 'Slots', profit: 120000, loss: 80000 },
  { name: 'Live Casino', profit: 95000, loss: 65000 },
  { name: 'Sports', profit: 78000, loss: 92000 },
]

export const recentActivity = [
  { id: 1, type: 'user', text: 'New user Rahul K. registered', time: '2 min ago', meta: 'ID 101' },
  { id: 2, type: 'bet', text: 'Large win on Aviator – ₹15,000', time: '15 min ago', meta: 'User #102' },
  { id: 3, type: 'deposit', text: 'Deposit completed (UPI) – ₹5,000', time: '32 min ago', meta: 'DEP-8847' },
  { id: 4, type: 'deposit', text: 'Deposit completed (IMPS) – ₹10,000', time: '28 min ago', meta: 'DEP-8848' },
  { id: 5, type: 'withdrawal', text: 'Withdrawal processed – ₹12,000', time: '1 hr ago', meta: 'WD-5521' },
  { id: 6, type: 'withdrawal', text: 'Withdrawal pending – ₹8,000', time: '45 min ago', meta: 'WD-5522' },
  { id: 7, type: 'risk', text: 'Risk alert: multiple accounts flagged', time: '2 hr ago', meta: 'User #104' },
]

export const riskAlerts = [
  { id: 1, severity: 'high', user: 'User #103', reason: 'Multiple accounts same IP', time: '1 hr ago' },
  { id: 2, severity: 'medium', user: 'User #107', reason: 'Unusual withdrawal pattern', time: '3 hr ago' },
]

// Account statement – from/to (e.g. user or account id), openingBal, amount (+ credit / - debit), closingBal, transaction
export const accountStatementData = [
  { id: 1, date: '2026-03-03T18:05:06', from: 'branch1', to: 'branch1/mark42', openingBal: 125000, amount: -500, closingBal: 124500, transaction: 'Settlement Withdraw' },
  { id: 2, date: '2026-03-03T17:58:00', from: 'branch1/sahill7878', to: 'branch1', openingBal: 124500, amount: 1000, closingBal: 125500, transaction: 'Settlement Deposit' },
  { id: 3, date: '2026-03-03T17:45:22', from: 'branch1', to: 'branch1/harsh@2615', openingBal: 125500, amount: -2000, closingBal: 123500, transaction: 'Settlement Withdraw' },
  { id: 4, date: '2026-03-03T17:30:10', from: 'mahi@123457', to: 'branch1', openingBal: 123500, amount: 40000, closingBal: 163500, transaction: 'Settlement Deposit' },
  { id: 5, date: '2026-03-03T17:15:00', from: 'branch1', to: 'branch1/harsh312', openingBal: 163500, amount: -5000, closingBal: 158500, transaction: 'Settlement Withdraw' },
  { id: 6, date: '2026-03-03T16:50:00', from: 'branch1/avinash@199', to: 'branch1', openingBal: 158500, amount: 1500, closingBal: 160000, transaction: 'Settlement Deposit' },
  { id: 7, date: '2026-03-02T14:20:00', from: 'branch1', to: 'branch1/rohan_p', openingBal: 160000, amount: -1500, closingBal: 158500, transaction: 'Settlement Withdraw' },
  { id: 8, date: '2026-03-02T12:00:00', from: 'branch2/kavya', to: 'branch1', openingBal: 158500, amount: 8000, closingBal: 166500, transaction: 'Settlement Deposit' },
  { id: 9, date: '2026-02-28T11:30:00', from: 'branch1', to: 'branch1/neha_g', openingBal: 166500, amount: -3000, closingBal: 163500, transaction: 'Settlement Withdraw' },
  { id: 10, date: '2026-02-27T18:05:00', from: 'branch1/priya_s', to: 'branch1', openingBal: 163500, amount: 2500, closingBal: 166000, transaction: 'Settlement Deposit' },
  { id: 11, date: '2026-02-26T09:15:00', from: 'branch1', to: 'branch1/amit_r', openingBal: 166000, amount: -10000, closingBal: 156000, transaction: 'Settlement Withdraw' },
  { id: 12, date: '2026-02-25T16:00:00', from: 'branch1', to: 'branch1/sneha_m', openingBal: 156000, amount: -2000, closingBal: 154000, transaction: 'Settlement Withdraw' },
  { id: 13, date: '2026-02-24T14:30:00', from: 'branch1/vikram_j', to: 'branch1', openingBal: 154000, amount: 6000, closingBal: 160000, transaction: 'Settlement Deposit' },
  { id: 14, date: '2026-02-23T10:00:00', from: 'branch1', to: 'branch1/rahul_k', openingBal: 160000, amount: -7500, closingBal: 152500, transaction: 'Settlement Withdraw' },
  { id: 15, date: '2026-02-22T15:45:00', from: 'branch1/tushar', to: 'branch1', openingBal: 152500, amount: 12000, closingBal: 164500, transaction: 'Settlement Deposit' },
]

// Users (for User List: uuid, mobile, kyc, referralCode, createdAt, passwordChangedAt, lastLoginAt, etc.)
// passwordChangedAt = when user last changed password; updatedAt = profile last updated; country, timezone, language for locale
export const usersData = [
  { id: 1, uuid: '6486486', name: 'Tushar Mishra', email: 'guddu059665@gmail.com', phone: '+91 9057587815', status: 'active', kyc: 'not_verified', referralCode: 'GUDD415931', balanceFiat: 24500, bonusBalance: 500, createdAt: '2026-02-24T09:49:00', updatedAt: '2026-03-01T10:00:00', lastLogin: '2 min ago', lastLoginAt: '2026-03-03T14:28:00', lastLoginIp: '106.219.69.156', passwordChangedAt: '2026-02-28T11:20:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 2, uuid: '90744952', name: 'Sanjay kumar', email: 'Admin@wrathcode.com', phone: '+91 7897897890', status: 'pending', kyc: 'verified', referralCode: 'ADM1734662', balanceFiat: 81200, bonusBalance: 0, createdAt: '2026-02-23T14:20:00', updatedAt: '2026-02-28T09:15:00', lastLogin: '1 hr ago', lastLoginAt: '2026-03-03T13:00:00', lastLoginIp: '192.168.1.10', passwordChangedAt: '2026-02-20T16:45:00', emailVerified: true, phoneVerified: true, twoFaEnabled: true, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 3, uuid: '6486487', name: 'Pallav Soni', email: 'pallav@example.com', phone: '+91 9876543210', status: 'active', kyc: 'verified', referralCode: 'PAL648648', balanceFiat: 42000, bonusBalance: 1200, createdAt: '2026-02-22T11:15:00', updatedAt: '2026-03-02T08:00:00', lastLogin: '15 min ago', lastLoginAt: '2026-03-03T14:15:00', lastLoginIp: '10.0.0.5', passwordChangedAt: null, emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'hi' },
  { id: 4, uuid: '6486488', name: 'Shubham Singh', email: 'shubham@example.com', phone: null, status: 'active', kyc: 'pending', referralCode: 'SHU882991', balanceFiat: 12000, bonusBalance: 0, createdAt: '2026-02-21T16:30:00', updatedAt: '2026-02-21T16:30:00', lastLogin: '5 min ago', lastLoginAt: '2026-03-03T14:25:00', lastLoginIp: '106.219.69.200', passwordChangedAt: '2026-02-25T09:00:00', emailVerified: true, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 5, uuid: '6486489', name: 'Rahul K.', email: 'rahul@example.com', phone: '+91 98765 43210', status: 'active', kyc: 'verified', referralCode: 'RAH415931', balanceFiat: 24500, bonusBalance: 0, createdAt: '2026-02-20T09:00:00', updatedAt: '2026-02-27T12:00:00', lastLogin: '2 min ago', lastLoginAt: '2026-03-03T14:28:00', lastLoginIp: '106.219.69.156', passwordChangedAt: '2026-02-22T14:30:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 6, uuid: '6486490', name: 'Priya S.', email: 'priya@example.com', phone: '+91 98765 43211', status: 'pending', kyc: 'not_verified', referralCode: 'PRI1734662', balanceFiat: 81200, bonusBalance: 500, createdAt: '2026-02-19T10:45:00', updatedAt: '2026-02-26T11:00:00', lastLogin: '1 hr ago', lastLoginAt: '2026-03-03T13:30:00', lastLoginIp: '192.168.1.20', passwordChangedAt: '2026-02-19T10:50:00', emailVerified: false, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 7, uuid: '6486491', name: 'Amit R.', email: 'amit@example.com', phone: '+91 98765 43212', status: 'banned', kyc: 'not_verified', referralCode: 'AMI648648', balanceFiat: 0, bonusBalance: 0, createdAt: '2026-02-18T08:20:00', updatedAt: '2026-02-24T09:00:00', lastLogin: '5 days ago', lastLoginAt: '2026-02-26T10:00:00', lastLoginIp: '10.0.0.8', passwordChangedAt: '2026-02-18T08:25:00', emailVerified: false, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en', failedLoginAttempts: 5, lastFailedLogin: '2026-02-26T10:05:00' },
  { id: 8, uuid: '6486492', name: 'Sneha M.', email: 'sneha@example.com', phone: '+91 98765 43213', status: 'active', kyc: 'verified', referralCode: 'SNE882991', balanceFiat: 153000, bonusBalance: 2000, createdAt: '2026-02-17T14:00:00', updatedAt: '2026-03-01T16:00:00', lastLogin: '30 min ago', lastLoginAt: '2026-03-03T14:00:00', lastLoginIp: '106.219.70.10', passwordChangedAt: '2026-02-28T12:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: true, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 9, uuid: '6486493', name: 'Vikram J.', email: 'vikram@example.com', phone: null, status: 'active', kyc: 'pending', referralCode: 'VIK415931', balanceFiat: 42000, bonusBalance: 0, createdAt: '2026-02-16T11:30:00', updatedAt: '2026-02-20T10:00:00', lastLogin: '15 min ago', lastLoginAt: '2026-03-03T14:15:00', lastLoginIp: '106.219.69.100', passwordChangedAt: null, emailVerified: true, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 10, uuid: '6486494', name: 'Kavya L.', email: 'kavya@example.com', phone: '+91 98765 43215', status: 'active', kyc: 'verified', referralCode: 'KAV1734662', balanceFiat: 12000, bonusBalance: 0, createdAt: '2026-02-15T09:15:00', updatedAt: '2026-02-28T14:00:00', lastLogin: '5 min ago', lastLoginAt: '2026-03-03T14:25:00', lastLoginIp: '192.168.1.5', passwordChangedAt: '2026-02-15T09:20:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 11, uuid: '6486495', name: 'Neha G.', email: 'neha@example.com', phone: '+91 9123456789', status: 'active', kyc: 'not_verified', referralCode: 'NEH648648', balanceFiat: 35000, bonusBalance: 800, createdAt: '2026-02-14T16:45:00', updatedAt: '2026-02-25T09:00:00', lastLogin: '1 hr ago', lastLoginAt: '2026-03-03T13:30:00', lastLoginIp: '10.0.0.12', passwordChangedAt: '2026-02-20T11:00:00', emailVerified: false, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'hi' },
  { id: 12, uuid: '6486496', name: 'Rohan P.', email: 'rohan@example.com', phone: '+91 9234567890', status: 'pending', kyc: 'verified', referralCode: 'ROH882991', balanceFiat: 28000, bonusBalance: 0, createdAt: '2026-02-13T08:00:00', updatedAt: '2026-02-22T15:00:00', lastLogin: '2 hr ago', lastLoginAt: '2026-03-03T12:30:00', lastLoginIp: '106.219.69.88', passwordChangedAt: '2026-02-18T16:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 13, uuid: '6486497', name: 'Anita D.', email: 'anita@example.com', phone: null, status: 'active', kyc: 'pending', referralCode: 'ANI415931', balanceFiat: 51000, bonusBalance: 0, createdAt: '2026-02-12T12:20:00', updatedAt: '2026-02-12T12:20:00', lastLogin: '20 min ago', lastLoginAt: '2026-03-03T14:10:00', lastLoginIp: '192.168.1.30', passwordChangedAt: null, emailVerified: true, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 14, uuid: '6486498', name: 'Karan M.', email: 'karan@example.com', phone: '+91 9345678901', status: 'active', kyc: 'verified', referralCode: 'KAR1734662', balanceFiat: 67000, bonusBalance: 1500, createdAt: '2026-02-11T10:10:00', updatedAt: '2026-03-02T10:00:00', lastLogin: '45 min ago', lastLoginAt: '2026-03-03T13:45:00', lastLoginIp: '106.219.70.20', passwordChangedAt: '2026-02-25T09:30:00', emailVerified: true, phoneVerified: true, twoFaEnabled: true, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 15, uuid: '6486499', name: 'Pooja S.', email: 'pooja@example.com', phone: '+91 9456789012', status: 'active', kyc: 'not_verified', referralCode: 'POO648648', balanceFiat: 19000, bonusBalance: 0, createdAt: '2026-02-10T15:30:00', updatedAt: '2026-02-28T11:00:00', lastLogin: '3 min ago', lastLoginAt: '2026-03-03T14:27:00', lastLoginIp: '10.0.0.3', passwordChangedAt: '2026-02-10T15:35:00', emailVerified: false, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 16, uuid: '6486500', name: 'Arjun T.', email: 'arjun@example.com', phone: '+91 9567890123', status: 'pending', kyc: 'verified', referralCode: 'ARJ882991', balanceFiat: 44000, bonusBalance: 0, createdAt: '2026-02-09T09:45:00', updatedAt: '2026-02-20T14:00:00', lastLogin: '1 hr ago', lastLoginAt: '2026-03-03T13:30:00', lastLoginIp: '106.219.69.55', passwordChangedAt: '2026-02-14T10:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 17, uuid: '6486501', name: 'Meera K.', email: 'meera@example.com', phone: null, status: 'active', kyc: 'pending', referralCode: 'MEE415931', balanceFiat: 72000, bonusBalance: 0, createdAt: '2026-02-08T13:00:00', updatedAt: '2026-02-25T09:00:00', lastLogin: '10 min ago', lastLoginAt: '2026-03-03T14:20:00', lastLoginIp: '192.168.1.40', passwordChangedAt: null, emailVerified: true, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 18, uuid: '6486502', name: 'Vivek R.', email: 'vivek@example.com', phone: '+91 9678901234', status: 'active', kyc: 'verified', referralCode: 'VIV1734662', balanceFiat: 31000, bonusBalance: 500, createdAt: '2026-02-07T11:20:00', updatedAt: '2026-03-01T08:00:00', lastLogin: '30 min ago', lastLoginAt: '2026-03-03T14:00:00', lastLoginIp: '106.219.70.30', passwordChangedAt: '2026-02-22T13:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'hi' },
  { id: 19, uuid: '6486503', name: 'Divya N.', email: 'divya@example.com', phone: '+91 9789012345', status: 'active', kyc: 'not_verified', referralCode: 'DIV648648', balanceFiat: 55000, bonusBalance: 0, createdAt: '2026-02-06T08:15:00', updatedAt: '2026-02-24T16:00:00', lastLogin: '2 hr ago', lastLoginAt: '2026-03-03T12:30:00', lastLoginIp: '10.0.0.7', passwordChangedAt: '2026-02-15T11:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 20, uuid: '6486504', name: 'Suresh B.', email: 'suresh@example.com', phone: '+91 9890123456', status: 'banned', kyc: 'not_verified', referralCode: 'SUR882991', balanceFiat: 0, bonusBalance: 0, createdAt: '2026-02-05T14:50:00', updatedAt: '2026-02-23T10:00:00', lastLogin: '5 days ago', lastLoginAt: '2026-02-26T09:00:00', lastLoginIp: '106.219.69.99', passwordChangedAt: '2026-02-05T15:00:00', emailVerified: false, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en', failedLoginAttempts: 3, lastFailedLogin: '2026-02-26T09:05:00' },
  { id: 21, uuid: '6486505', name: 'Lakshmi V.', email: 'lakshmi@example.com', phone: '+91 9901234567', status: 'active', kyc: 'verified', referralCode: 'LAK415931', balanceFiat: 88000, bonusBalance: 3000, createdAt: '2026-02-04T10:00:00', updatedAt: '2026-03-02T12:00:00', lastLogin: '5 min ago', lastLoginAt: '2026-03-03T14:25:00', lastLoginIp: '106.219.70.40', passwordChangedAt: '2026-02-28T14:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: true, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 22, uuid: '6486506', name: 'Rajesh C.', email: 'rajesh@example.com', phone: null, status: 'pending', kyc: 'pending', referralCode: 'RAJ1734662', balanceFiat: 23000, bonusBalance: 0, createdAt: '2026-02-03T16:30:00', updatedAt: '2026-02-18T11:00:00', lastLogin: '1 hr ago', lastLoginAt: '2026-03-03T13:20:00', lastLoginIp: '192.168.1.50', passwordChangedAt: null, emailVerified: false, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 23, uuid: '6486507', name: 'Kiran H.', email: 'kiran@example.com', phone: '+91 9012345678', status: 'active', kyc: 'verified', referralCode: 'KIR648648', balanceFiat: 41000, bonusBalance: 0, createdAt: '2026-02-02T09:20:00', updatedAt: '2026-02-26T09:00:00', lastLogin: '15 min ago', lastLoginAt: '2026-03-03T14:15:00', lastLoginIp: '10.0.0.9', passwordChangedAt: '2026-02-20T08:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 24, uuid: '6486508', name: 'Nisha O.', email: 'nisha@example.com', phone: '+91 9123456780', status: 'active', kyc: 'not_verified', referralCode: 'NIS882991', balanceFiat: 16000, bonusBalance: 0, createdAt: '2026-02-01T12:45:00', updatedAt: '2026-02-22T14:00:00', lastLogin: '45 min ago', lastLoginAt: '2026-03-03T13:45:00', lastLoginIp: '106.219.69.120', passwordChangedAt: '2026-02-08T12:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'hi' },
  { id: 25, uuid: '6486509', name: 'Manoj I.', email: 'manoj@example.com', phone: '+91 9234567801', status: 'active', kyc: 'pending', referralCode: 'MAN415931', balanceFiat: 62000, bonusBalance: 1000, createdAt: '2026-01-31T08:00:00', updatedAt: '2026-03-01T10:00:00', lastLogin: '20 min ago', lastLoginAt: '2026-03-03T14:10:00', lastLoginIp: '192.168.1.60', passwordChangedAt: '2026-02-10T09:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 26, uuid: '6486510', name: 'Preeti U.', email: 'preeti@example.com', phone: null, status: 'pending', kyc: 'verified', referralCode: 'PRE1734662', balanceFiat: 33000, bonusBalance: 0, createdAt: '2026-01-30T15:15:00', updatedAt: '2026-02-20T15:00:00', lastLogin: '2 hr ago', lastLoginAt: '2026-03-03T12:20:00', lastLoginIp: '106.219.70.50', passwordChangedAt: null, emailVerified: true, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 27, uuid: '6486511', name: 'Gaurav Y.', email: 'gaurav@example.com', phone: '+91 9345678012', status: 'active', kyc: 'verified', referralCode: 'GAU648648', balanceFiat: 49000, bonusBalance: 0, createdAt: '2026-01-29T11:00:00', updatedAt: '2026-02-28T08:00:00', lastLogin: '10 min ago', lastLoginAt: '2026-03-03T14:20:00', lastLoginIp: '10.0.0.11', passwordChangedAt: '2026-02-15T10:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 28, uuid: '6486512', name: 'Sunita E.', email: 'sunita@example.com', phone: '+91 9456780123', status: 'active', kyc: 'not_verified', referralCode: 'SUN882991', balanceFiat: 27000, bonusBalance: 0, createdAt: '2026-01-28T13:30:00', updatedAt: '2026-02-19T11:00:00', lastLogin: '1 hr ago', lastLoginAt: '2026-03-03T13:30:00', lastLoginIp: '106.219.69.140', passwordChangedAt: '2026-01-28T13:35:00', emailVerified: false, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 29, uuid: '6486513', name: 'Deepak W.', email: 'deepak@example.com', phone: '+91 9567801234', status: 'active', kyc: 'pending', referralCode: 'DEE415931', balanceFiat: 71000, bonusBalance: 0, createdAt: '2026-01-27T09:45:00', updatedAt: '2026-02-25T09:00:00', lastLogin: '5 min ago', lastLoginAt: '2026-03-03T14:25:00', lastLoginIp: '192.168.1.70', passwordChangedAt: null, emailVerified: true, phoneVerified: true, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 30, uuid: '6486514', name: 'Rekha Q.', email: 'rekha@example.com', phone: null, status: 'pending', kyc: 'not_verified', referralCode: 'REK1734662', balanceFiat: 18000, bonusBalance: 0, createdAt: '2026-01-26T14:20:00', updatedAt: '2026-01-26T14:20:00', lastLogin: '30 min ago', lastLoginAt: '2026-03-03T14:00:00', lastLoginIp: '10.0.0.15', passwordChangedAt: '2026-01-30T12:00:00', emailVerified: false, phoneVerified: false, twoFaEnabled: false, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
  { id: 31, uuid: '6486515', name: 'Anil Z.', email: 'anil@example.com', phone: '+91 9678012345', status: 'active', kyc: 'verified', referralCode: 'ANI648648', balanceFiat: 92000, bonusBalance: 2000, createdAt: '2026-01-25T10:10:00', updatedAt: '2026-03-02T14:00:00', lastLogin: '3 min ago', lastLoginAt: '2026-03-03T14:27:00', lastLoginIp: '106.219.70.60', passwordChangedAt: '2026-02-20T11:00:00', emailVerified: true, phoneVerified: true, twoFaEnabled: true, country: 'IN', timezone: 'Asia/Kolkata', language: 'en' },
]

// User activity (bets, logins, transactions) for profile drawer
export const userBets = (userId) => [
  { id: 1, game: 'Aviator', amount: 500, result: 'win', payout: 1200, time: '2024-01-15 10:30' },
  { id: 2, game: 'Teen Patti', amount: 1000, result: 'loss', payout: 0, time: '2024-01-15 09:15' },
]

// Bets management – id, userId, userName, uplineId, uplineName, downlineLevel, market, selection, stake, odds, potentialPayout, exposure, status, settledPl, currency, createdAt, settledAt
// downlineLevel: 0 = direct, 1 = level 1 downline, 2 = level 2 downline
export const betsData = [
  { id: 'BET-1001', userId: 1, userName: 'Tushar Mishra', uplineId: 5, uplineName: 'Rahul K.', downlineLevel: 0, market: 'Cricket - IPL', selection: 'Mumbai Indians', stake: 5000, odds: 1.85, potentialPayout: 9250, exposure: 4250, status: 'open', settledPl: null, currency: 'INR', createdAt: '2026-03-03T10:30:00', settledAt: null },
  { id: 'BET-1002', userId: 2, userName: 'Sanjay kumar', uplineId: 5, uplineName: 'Rahul K.', downlineLevel: 0, market: 'Football - EPL', selection: 'Chelsea Win', stake: 2000, odds: 2.10, potentialPayout: 4200, exposure: 2200, status: 'settled', settledPl: -2000, currency: 'INR', createdAt: '2026-03-02T14:20:00', settledAt: '2026-03-02T18:00:00' },
  { id: 'BET-1003', userId: 4, userName: 'Shubham Singh', uplineId: 3, uplineName: 'Pallav Soni', downlineLevel: 0, market: 'Cricket - IPL', selection: 'CSK', stake: 10000, odds: 1.72, potentialPayout: 17200, exposure: 7200, status: 'open', settledPl: null, currency: 'INR', createdAt: '2026-03-03T09:15:00', settledAt: null },
  { id: 'BET-1004', userId: 5, userName: 'Rahul K.', uplineId: null, uplineName: '–', downlineLevel: null, market: 'Teen Patti', selection: 'Side Bet', stake: 500, odds: 2.00, potentialPayout: 1000, exposure: 500, status: 'settled', settledPl: 500, currency: 'INR', createdAt: '2026-03-01T11:00:00', settledAt: '2026-03-01T11:45:00' },
  { id: 'BET-1005', userId: 6, userName: 'Priya S.', uplineId: 8, uplineName: 'Sneha M.', downlineLevel: 1, market: 'Aviator', selection: 'Crash 2.5x', stake: 1500, odds: 2.50, potentialPayout: 3750, exposure: 2250, status: 'open', settledPl: null, currency: 'INR', createdAt: '2026-03-03T08:45:00', settledAt: null },
  { id: 'BET-1006', userId: 8, userName: 'Sneha M.', uplineId: null, uplineName: '–', downlineLevel: null, market: 'Cricket - IPL', selection: 'RCB', stake: 25000, odds: 1.90, potentialPayout: 47500, exposure: 22500, status: 'open', settledPl: null, currency: 'INR', createdAt: '2026-03-03T07:00:00', settledAt: null },
  { id: 'BET-1007', userId: 10, userName: 'Kavya L.', uplineId: 8, uplineName: 'Sneha M.', downlineLevel: 0, market: 'Football - EPL', selection: 'Draw', stake: 3000, odds: 3.20, potentialPayout: 9600, exposure: 6600, status: 'settled', settledPl: -3000, currency: 'INR', createdAt: '2026-03-02T16:00:00', settledAt: '2026-03-02T19:30:00' },
  { id: 'BET-1008', userId: 3, userName: 'Pallav Soni', uplineId: null, uplineName: '–', downlineLevel: null, market: 'Andar Bahar', selection: 'Andar', stake: 2000, odds: 1.95, potentialPayout: 3900, exposure: 1900, status: 'cancelled', settledPl: 0, currency: 'INR', createdAt: '2026-03-02T12:00:00', settledAt: '2026-03-02T12:05:00' },
  { id: 'BET-1009', userId: 1, userName: 'Tushar Mishra', uplineId: 5, uplineName: 'Rahul K.', downlineLevel: 0, market: 'Aviator', selection: 'Auto 1.5x', stake: 1000, odds: 1.50, potentialPayout: 1500, exposure: 500, status: 'settled', settledPl: 500, currency: 'INR', createdAt: '2026-03-02T10:00:00', settledAt: '2026-03-02T10:02:00' },
  { id: 'BET-1010', userId: 14, userName: 'Karan M.', uplineId: 8, uplineName: 'Sneha M.', downlineLevel: 1, market: 'Cricket - IPL', selection: 'GT', stake: 8000, odds: 2.05, potentialPayout: 16400, exposure: 8400, status: 'open', settledPl: null, currency: 'INR', createdAt: '2026-03-03T11:00:00', settledAt: null },
  { id: 'BET-1011', userId: 5, userName: 'Rahul K.', uplineId: null, uplineName: '–', downlineLevel: null, market: 'Rummy', selection: 'Win', stake: 5000, odds: 2.00, potentialPayout: 10000, exposure: 5000, status: 'open', settledPl: null, currency: 'INR', createdAt: '2026-03-03T09:00:00', settledAt: null },
  { id: 'BET-1012', userId: 8, userName: 'Sneha M.', uplineId: null, uplineName: '–', downlineLevel: null, market: 'Dragon Tiger', selection: 'Tiger', stake: 4000, odds: 1.98, potentialPayout: 7920, exposure: 3920, status: 'settled', settledPl: -4000, currency: 'INR', createdAt: '2026-03-01T20:00:00', settledAt: '2026-03-01T20:15:00' },
]
// Bet summary: exposure, P/L, counts, by upline/downline
export const betSummary = {
  totalExposure: 87220,
  totalPl: -4200,
  openBetsCount: 6,
  settledCount: 5,
  cancelledCount: 1,
  uplineBreakdown: [
    { uplineId: null, uplineName: 'Direct (No Upline)', exposure: 35420, pl: 2500, openCount: 3, settledCount: 2 },
    { uplineId: 5, uplineName: 'Rahul K.', exposure: 29700, pl: -1700, openCount: 2, settledCount: 2 },
    { uplineId: 8, uplineName: 'Sneha M.', exposure: 22100, pl: -5000, openCount: 2, settledCount: 1 },
    { uplineId: 3, uplineName: 'Pallav Soni', exposure: 7200, pl: 0, openCount: 1, settledCount: 0 },
  ],
  downlineBreakdown: [
    { level: 0, label: 'Direct', exposure: 52100, pl: -1200, betCount: 8 },
    { level: 1, label: 'Level 1', exposure: 35120, pl: -3000, betCount: 4 },
  ],
}
export const userLogins = (userId) => [
  { id: 1, ip: '192.168.1.1', device: 'Chrome / Windows', time: '2024-01-15 10:28' },
  { id: 2, ip: '192.168.1.1', device: 'Chrome / Windows', time: '2024-01-14 18:00' },
]
export const userTransactions = (userId) => [
  { id: 1, type: 'deposit', amount: 5000, method: 'UPI', status: 'completed', time: '2024-01-14 16:00' },
  { id: 2, type: 'withdrawal', amount: 2000, method: 'Bank', status: 'pending', time: '2024-01-15 09:00' },
]

// Deposits – userId matches usersData id (1–31) so approve can credit balance
export const depositsData = [
  { id: 'DEP-001', userId: 1, user: 'Tushar Mishra', amount: 5000, currency: 'INR', method: 'UPI', status: 'completed', createdAt: '2024-01-15 10:28' },
  { id: 'DEP-002', userId: 2, user: 'Sanjay kumar', amount: 2000, currency: 'INR', method: 'Paytm', status: 'completed', createdAt: '2024-01-15 09:15' },
  { id: 'DEP-003', userId: 4, user: 'Shubham Singh', amount: 10000, currency: 'INR', method: 'IMPS', status: 'completed', createdAt: '2024-01-15 11:00' },
  { id: 'DEP-004', userId: 5, user: 'Rahul K.', amount: 5000, currency: 'INR', method: 'Bank', status: 'pending', createdAt: '2024-01-15 11:30' },
  { id: 'DEP-005', userId: 1, user: 'Tushar Mishra', amount: 3000, currency: 'INR', method: 'GPay', status: 'completed', createdAt: '2024-01-15 09:00' },
  { id: 'DEP-006', userId: 10, user: 'Kavya L.', amount: 15000, currency: 'INR', method: 'IMPS', status: 'completed', createdAt: '2024-01-14 16:00' },
  { id: 'DEP-007', userId: 6, user: 'Priya S.', amount: 8000, currency: 'INR', method: 'UPI', status: 'pending', createdAt: '2024-01-16 09:00' },
  { id: 'DEP-008', userId: 4, user: 'Shubham Singh', amount: 4000, currency: 'INR', method: 'Bank', status: 'rejected', createdAt: '2024-01-14 12:00' },
  { id: 'DEP-009', userId: 3, user: 'Pallav Soni', amount: 2000, currency: 'INR', method: 'Paytm', status: 'rejected', createdAt: '2024-01-13 15:30' },
  { id: 'DEP-010', userId: 5, user: 'Rahul K.', amount: 6000, currency: 'INR', method: 'IMPS', status: 'pending', createdAt: '2024-01-16 11:20' },
]
export const withdrawalsData = [
  { id: 'WD-001', userId: 6, user: 'Priya S.', amount: 12000, currency: 'INR', method: 'Bank', status: 'pending', createdAt: '2024-01-15 10:00' },
  { id: 'WD-002', userId: 8, user: 'Sneha M.', amount: 25000, currency: 'INR', method: 'Bank', status: 'approved', createdAt: '2024-01-14 16:00' },
  { id: 'WD-003', userId: 5, user: 'Rahul K.', amount: 5000, currency: 'INR', method: 'UPI', status: 'pending', createdAt: '2024-01-15 11:00' },
  { id: 'WD-004', userId: 1, user: 'Tushar Mishra', amount: 8000, currency: 'INR', method: 'UPI', status: 'approved', createdAt: '2024-01-14 18:00' },
  { id: 'WD-005', userId: 10, user: 'Kavya L.', amount: 4000, currency: 'INR', method: 'Paytm', status: 'approved', createdAt: '2024-01-14 12:00' },
  { id: 'WD-006', userId: 4, user: 'Shubham Singh', amount: 15000, currency: 'INR', method: 'Bank', status: 'rejected', rejectReason: 'Insufficient verification', createdAt: '2024-01-13 14:00' },
  { id: 'WD-007', userId: 7, user: 'Amit R.', amount: 3000, currency: 'INR', method: 'UPI', status: 'pending', createdAt: '2024-01-16 09:00' },
  { id: 'WD-008', userId: 2, user: 'Sanjay kumar', amount: 6000, currency: 'INR', method: 'Bank', status: 'rejected', rejectReason: 'Rejected by Admin', createdAt: '2024-01-12 11:00' },
]

// Games – activePlayers = concurrent players (display only)
export const gamesData = [
  { id: 1, name: 'Teen Patti', provider: 'In-house', category: 'Card', enabled: true, minBet: 10, maxBet: 50000, houseEdge: 2.5, status: 'live', activePlayers: 2840 },
  { id: 2, name: 'Aviator', provider: 'Spribe', category: 'Crash', enabled: true, minBet: 1, maxBet: 10000, houseEdge: 3, status: 'live', activePlayers: 1920 },
  { id: 3, name: 'Rummy', provider: 'In-house', category: 'Card', enabled: true, minBet: 20, maxBet: 20000, houseEdge: 2, status: 'live', activePlayers: 1654 },
  { id: 4, name: 'Dragon Tiger', provider: 'Evolution', category: 'Live', enabled: false, minBet: 50, maxBet: 100000, houseEdge: 2.8, status: 'maintenance', activePlayers: 0 },
  { id: 5, name: 'Andar Bahar', provider: 'In-house', category: 'Card', enabled: true, minBet: 5, maxBet: 25000, houseEdge: 2.2, status: 'live', activePlayers: 1221 },
  { id: 6, name: 'Roulette', provider: 'Evolution', category: 'Casino', enabled: true, minBet: 10, maxBet: 50000, houseEdge: 2.7, status: 'live', activePlayers: 890 },
  { id: 7, name: 'Lucky 7', provider: 'In-house', category: 'Casino', enabled: true, minBet: 1, maxBet: 5000, houseEdge: 3.5, status: 'live', activePlayers: 756 },
  { id: 8, name: 'Cricket Betting', provider: 'In-house', category: 'Sports', enabled: true, minBet: 10, maxBet: 100000, houseEdge: 5, status: 'live', activePlayers: 3100 },
  { id: 9, name: '32 Cards', provider: 'In-house', category: 'Card', enabled: true, minBet: 20, maxBet: 30000, houseEdge: 2, status: 'live', activePlayers: 612 },
  { id: 10, name: 'Football', provider: 'In-house', category: 'Sports', enabled: true, minBet: 10, maxBet: 50000, houseEdge: 5, status: 'live', activePlayers: 1890 },
]

// Bonuses – type: first_deposit | reload | free_spins | cashback | referral | promo; status: active | expired
export const bonusesData = [
  { id: 1, name: 'Welcome 100%', type: 'first_deposit', value: '100% up to ₹5,000', code: 'WELCOME100', wagering: 5, expiry: '2024-12-31', usage: 234, maxUsage: 500, status: 'active' },
  { id: 2, name: 'Reload 50%', type: 'reload', value: '50% up to ₹2,000', code: 'RELOAD50', wagering: 3, expiry: '2024-02-10', usage: 89, maxUsage: 1000, status: 'active' },
  { id: 3, name: 'Free Spins Weekend', type: 'free_spins', value: '50 FS', code: 'SPIN50', wagering: 0, expiry: '2024-01-14', usage: 456, maxUsage: 1000, status: 'expired' },
  { id: 4, name: 'Referral Bonus', type: 'referral', value: '₹500 per referral', code: null, wagering: 0, expiry: null, usage: 0, maxUsage: null, status: 'active' },
]
export const bonusAnalytics = { totalClaimed: 1250, totalWagered: 890000, activeCampaigns: 3 }

// Referrals
export const referralTree = [
  { id: 1, name: 'Rahul K.', referrals: 24, commission: 12000, tier: 'Gold', children: [
    { id: 2, name: 'User A', referrals: 5, commission: 2000, tier: 'Silver', children: [] },
    { id: 3, name: 'User B', referrals: 3, commission: 1200, tier: 'Bronze', children: [] },
  ]},
]
// Flat list for Referrals page table (referrerId matches usersData.id)
export const referrersList = [
  { id: 1, referrerId: 5, referrerName: 'Rahul K.', referrerEmail: 'rahul@example.com', referrals: 24, commission: 12000, tier: 'Gold' },
  { id: 2, referrerId: 6, referrerName: 'Priya S.', referrerEmail: 'priya@example.com', referrals: 18, commission: 9000, tier: 'Silver' },
  { id: 3, referrerId: 7, referrerName: 'Amit R.', referrerEmail: 'amit@example.com', referrals: 5, commission: 1200, tier: 'Bronze' },
  { id: 4, referrerId: 8, referrerName: 'Sneha M.', referrerEmail: 'sneha@example.com', referrals: 42, commission: 28000, tier: 'Platinum' },
  { id: 5, referrerId: 9, referrerName: 'Vikram J.', referrerEmail: 'vikram@example.com', referrals: 11, commission: 4500, tier: 'Silver' },
  { id: 6, referrerId: 3, referrerName: 'Pallav Soni', referrerEmail: 'pallav@example.com', referrals: 8, commission: 3200, tier: 'Bronze' },
]
export const referralPayouts = [
  { id: 1, referrer: 'Rahul K.', referrerId: 5, amount: 5000, status: 'paid', paidAt: '2024-01-14' },
  { id: 2, referrer: 'Priya S.', referrerId: 6, amount: 3000, status: 'pending', paidAt: null },
  { id: 3, referrer: 'Sneha M.', referrerId: 8, amount: 12000, status: 'paid', paidAt: '2024-01-13' },
  { id: 4, referrer: 'Vikram J.', referrerId: 9, amount: 1500, status: 'pending', paidAt: null },
]
export const referralStats = { totalReferrers: 2847, totalReferrals: 8421, commissionPaid: 420000, conversionRate: 12.4 }

// Risk / Flagged users
export const flaggedUsers = [
  { id: 101, name: 'Rahul K.', riskScore: 75, reasons: ['Multiple accounts', 'Same IP'], withdrawalFrozen: false, flaggedAt: '2024-01-15' },
  { id: 104, name: 'Sneha M.', riskScore: 90, reasons: ['Velocity', 'New account large deposit'], withdrawalFrozen: true, flaggedAt: '2024-01-14' },
]

// Reports
export const reportsPlData = profitLossData
export const reportsDepositWithdrawalData = [
  { month: 'Jan', deposits: 185, withdrawals: 92, depositAmount: 1850000, withdrawalAmount: 920000 },
  { month: 'Feb', deposits: 192, withdrawals: 88, depositAmount: 1920000, withdrawalAmount: 880000 },
  { month: 'Mar', deposits: 210, withdrawals: 95, depositAmount: 2100000, withdrawalAmount: 950000 },
]
export const reportsRevenueSummary = [
  { period: 'Today', amount: 42500, change: 8 },
  { period: 'This Week', amount: 240000, change: 18 },
  { period: 'This Month', amount: 920000, change: 12 },
]

// User-specific: deposits, withdrawals, tickets, referral (userId 1–31)
export const userDeposits = (userId) => [
  { id: `DEP-U${userId}-1`, amount: 5000, currency: 'INR', method: 'UPI', status: 'completed', createdAt: '2026-02-20T10:28:00' },
  { id: `DEP-U${userId}-2`, amount: 2000, currency: 'INR', method: 'GPay', status: 'completed', createdAt: '2026-02-18T14:15:00' },
  { id: `DEP-U${userId}-3`, amount: 10000, currency: 'INR', method: 'IMPS', status: 'pending', createdAt: '2026-02-22T09:00:00' },
].slice(0, 2 + (userId % 2))

export const userWithdrawals = (userId) => [
  { id: `WD-U${userId}-1`, amount: 3000, currency: 'INR', method: 'Bank', status: 'completed', createdAt: '2026-02-19T11:00:00' },
  { id: `WD-U${userId}-2`, amount: 5000, currency: 'INR', method: 'UPI', status: 'pending', createdAt: '2026-02-21T16:30:00' },
].slice(0, 1 + (userId % 2))

export const userTickets = (userId) => [
  { id: `TKT-U${userId}-1`, subject: 'Withdrawal delay', priority: 'high', status: 'open', createdAt: '2026-02-20T10:30:00' },
  { id: `TKT-U${userId}-2`, subject: 'Bonus not credited', priority: 'medium', status: 'closed', createdAt: '2026-02-15T14:00:00' },
].slice(0, 1 + (userId % 2))

export const userReferralData = (userId) => ({
  referredCount: 3 + (userId % 5),
  totalCommission: 1200 + userId * 100,
  payouts: [
    { amount: 500, status: 'paid', paidAt: '2026-02-10' },
    { amount: 300, status: 'pending', paidAt: null },
  ],
})

// Support tickets (global list) – status: open | resolved | closed
export const ticketsData = [
  { id: 'TKT-1001', userId: 101, userIdentifier: 'user_001', user: 'Rahul K.', email: 'rahul@example.com', subject: 'Withdrawal not received', description: 'I requested withdrawal 24 hours ago but amount not credited. Transaction ref: WD-8847. Please look into it.', status: 'open', createdAt: '2024-01-15 10:30', issueImage: null, messages: [
    { from: 'user', text: 'I requested withdrawal 24 hours ago.', time: '2024-01-15 10:30' },
    { from: 'agent', text: 'We have escalated to finance.', time: '2024-01-15 10:45' },
  ], adminNotes: 'Check WD-8847', attachments: [] },
  { id: 'TKT-1002', userId: 102, userIdentifier: 'user_002', user: 'Priya S.', email: 'priya@example.com', subject: 'Bonus code not working', description: 'I tried to apply WELCOME100 on my first deposit but it says code invalid. I have not used any welcome offer before.', status: 'open', createdAt: '2024-01-14 14:00', issueImage: null, messages: [
    { from: 'user', text: 'WELCOME100 says invalid.', time: '2024-01-14 14:00' },
    { from: 'agent', text: 'Checking your account.', time: '2024-01-14 15:00' },
  ], adminNotes: '', attachments: [] },
  { id: 'TKT-1003', userId: 104, userIdentifier: 'user_004', user: 'Sneha M.', email: 'sneha@example.com', subject: 'Account verification', description: 'I submitted my documents 3 days ago. When will my account be verified?', status: 'resolved', createdAt: '2024-01-13 09:15', issueImage: null, messages: [], adminNotes: '', attachments: [] },
  { id: 'TKT-1004', userId: 105, userIdentifier: 'user_005', user: 'Vikram J.', email: 'vikram@example.com', subject: 'Game crash – refund request', description: 'Aviator game crashed during my bet. I lost ₹5,000. Requesting refund.', status: 'closed', createdAt: '2024-01-12 08:00', issueImage: null, messages: [], adminNotes: 'Refund denied – T&C', attachments: [] },
]

// CMS – dummy banner images (Picsum placeholder)
export const bannersData = [
  { id: 1, title: 'Welcome Banner', imageUrl: 'https://picsum.photos/seed/banner1/800/400', active: true, order: 1, link: '/games' },
  { id: 2, title: 'Weekend Bonus', imageUrl: 'https://picsum.photos/seed/banner2/800/400', active: true, order: 2, link: '/bonuses' },
  { id: 3, title: 'New Games', imageUrl: 'https://picsum.photos/seed/banner3/800/400', active: false, order: 3, link: '/games' },
]
export const announcementsData = [
  { id: 1, title: 'New games live', content: 'Aviator and Crash added. Play now!', active: true, createdAt: '2024-01-10' },
  { id: 2, title: 'Maintenance notice', content: 'Scheduled maintenance on Jan 15, 2–4 AM IST.', active: true, createdAt: '2024-01-09' },
  { id: 3, title: 'Referral bonus', content: 'Invite friends and earn ₹500 per referral.', active: false, createdAt: '2024-01-08' },
]
export const staticPagesData = [
  { id: 1, slug: 'terms', title: 'Terms & Conditions', content: '...', lang: 'en', published: true, updatedAt: '2024-01-14' },
  { id: 2, slug: 'privacy', title: 'Privacy Policy', content: '...', lang: 'en', published: true, updatedAt: '2024-01-12' },
  { id: 3, slug: 'faq', title: 'FAQ', content: '...', lang: 'en', published: true, updatedAt: '2024-01-10' },
  { id: 4, slug: 'responsible-gaming', title: 'Responsible Gaming', content: '...', lang: 'en', published: true, updatedAt: '2024-01-08' },
]

// Notifications (sent list) – status: active | inactive
export const notificationsList = [
  { id: 1, userId: 5, userName: 'Rahul K.', userEmail: 'rahul@example.com', title: 'Withdrawal processed', message: 'Your withdrawal of ₹12,000 has been processed.', link: null, sentAt: '2024-01-15 14:30', status: 'active' },
  { id: 2, userId: 6, userName: 'Priya S.', userEmail: 'priya@example.com', title: 'Bonus credited', message: 'Welcome bonus has been credited to your account.', link: '/bonuses', sentAt: '2024-01-14 11:00', status: 'active' },
  { id: 3, userId: 8, userName: 'Sneha M.', userEmail: 'sneha@example.com', title: 'Account verified', message: 'Your KYC has been verified successfully.', link: null, sentAt: '2024-01-13 09:15', status: 'active' },
  { id: 4, userId: 1, userName: 'Tushar Mishra', userEmail: 'guddu059665@gmail.com', title: 'Maintenance notice', message: 'Scheduled maintenance on Jan 20, 2–4 AM.', link: null, sentAt: '2024-01-10 18:00', status: 'inactive' },
]

// Admin logs – ADMIN, ACTION, DETAILS, IP, STATUS, TIME (64 entries for pagination)
const adminLogActions = ['LOGIN SUCCESS', 'LOGIN STEP1 OTP SENT', 'LOGIN STEPLOTD SENT', 'LOGOUT', 'USER_EDIT', 'WITHDRAWAL_APPROVE']
const adminLogsRaw = []
for (let i = 1; i <= 64; i++) {
  const isFailure = i === 12
  adminLogsRaw.push({
    id: i,
    admin: 'admin@wrathcode.com',
    adminType: 1,
    action: i === 12 ? 'LOGIN STEPLOTD SENT' : (i % 3 === 0 ? 'LOGIN STEP1 OTP SENT' : 'LOGIN SUCCESS'),
    details: '-',
    ip: `223.184.${Math.floor(i / 20) + 40}.${(i % 256)}`,
    status: isFailure ? 'failure' : 'success',
    time: new Date(2026, 1, 25 + Math.floor(i / 20), 10 + (i % 12), (i * 3) % 60),
  })
}
export const auditLogsData = adminLogsRaw.map((l) => ({ ...l, time: l.time.toISOString() }))

// Settings defaults
export const settingsDefaults = {
  globalLimits: { minDeposit: 100, maxWithdrawalPerDay: 100000 },
  featureToggles: { maintenanceMode: false, newRegistrations: true },
}
