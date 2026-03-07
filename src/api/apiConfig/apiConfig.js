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
  masterWallets: "/api/v1/master/wallets",
  masterGames: "/api/v1/master/games",
  masterSiteSettings: "/api/v1/master/site-settings",
};
