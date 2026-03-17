// Admin API base URL from .env (REACT_APP_BETTING_API_URL), e.g. http://localhost:5008
const baseUrl = (process.env.REACT_APP_BETTING_API_URL || "").trim() || "https://gamingbackend.wrathcode.com";

export const deployedUrl = `${window.origin}/`;

export const ApiConfig = {
  baseUrl,
  // Master admin
  masterLogin: "/api/v1/master/login",
  masterDashboard: "/api/v1/master/dashboard",
  masterAdminLogs: "/api/v1/master/admin-logs",
  masterUsers: "/api/v1/master/users",
  masterDepositRequests: "/api/v1/master/deposit-requests",
  masterWithdrawalRequests: "/api/v1/master/withdrawal-requests",
  masterWallets: "/api/v1/master/wallets",
  masterGames: "/api/v1/master/games",
  masterSiteSettings: "/api/v1/master/site-settings",
  masterPlatformConfiguration: "/api/v1/master/platform-configuration",
  masterDepositAccount: "/api/v1/master/deposit-account",
  masterDepositWithdrawalList: "/api/v1/master/deposit-withdrawal-list",
  masterDepositsWithdrawalsMonthwise: "/api/v1/master/deposits-withdrawals-monthwise",
  masterProfitLossByCategory: "/api/v1/master/profit-loss-by-category",
  masterTransactionLimits: "/api/v1/master/transaction-limits",
  masterBets: "/api/v1/master/bets",
  masterCasinoGameHistory: "/api/v1/master/casino-game-history",
  masterSubAdmin: "/api/v1/master/sub-admin",
  masterNotifications: "/api/v1/master/notifications",
  supportAdmin: "/api/v1/support/admin",
};
