import { ApiConfig } from "../apiConfig/apiConfig";
import { ApiCallGet, ApiCallGetVerifyRegistration, ApiCallPost, ApiCallPostFormData, ApiCallPut, ApiCallPutFormData, ApiCallPatch, ApiCallDelete } from "../apiConfig/apiCall";

const AuthService = {
  /** Master admin login: POST /api/v1/master/login { email, password } → { success, message, data: { admin, accessToken } } */
  masterLogin: async (email, password) => {
    const { baseUrl, masterLogin } = ApiConfig;
    const url = `${baseUrl}${masterLogin}`;
    const params = { email, password };
    const headers = { "Content-Type": "application/json" };
    return ApiCallPost(url, params, headers);
  },

  /** GET /api/v1/master/dashboard → { success, data: { users, deposit, withdrawal, games } } */
  getMasterDashboard: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDashboard } = ApiConfig;
    const url = `${baseUrl}${masterDashboard}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/admin-logs?page=1&limit=20&activity=login → { success, data: { logs, pagination } } */
  getMasterAdminLogs: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterAdminLogs } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", params.limit);
    if (params.activity) q.set("activity", params.activity);
    const query = q.toString();
    const url = `${baseUrl}${masterAdminLogs}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/site-settings → { success, data: { settings: { gamingBettingEnabled, depositEnabled, ... } } } */
  getMasterSiteSettings: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSiteSettings } = ApiConfig;
    const url = `${baseUrl}${masterSiteSettings}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** PATCH /api/v1/master/site-settings body: { settings: { gamingBettingEnabled, depositEnabled, ... } } */
  patchMasterSiteSettings: async (settings) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSiteSettings } = ApiConfig;
    const url = `${baseUrl}${masterSiteSettings}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, { settings }, headers);
  },

  /** GET /api/v1/master/platform-configuration → { success, data: { gameServiceStatus, inPlayServiceStatus, ... } } */
  getPlatformConfiguration: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterPlatformConfiguration } = ApiConfig;
    const url = `${baseUrl}${masterPlatformConfiguration}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** PATCH /api/v1/master/platform-configuration body: { gameServiceStatus?, inPlayServiceStatus?, ... } (min 1 key, all boolean) */
  patchPlatformConfiguration: async (payload) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterPlatformConfiguration } = ApiConfig;
    const url = `${baseUrl}${masterPlatformConfiguration}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, payload, headers);
  },

  /** GET /api/v1/master/users?page=1&limit=10&search=...&accountStatus=...&isActive=... → { success, data: { users, pagination } } */
  getMasterUsers: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", params.limit);
    if (params.search) q.set("search", params.search);
    if (params.accountStatus) q.set("accountStatus", params.accountStatus);
    if (params.isActive !== undefined && params.isActive !== null) q.set("isActive", String(params.isActive));
    const query = q.toString();
    const url = `${baseUrl}${masterUsers}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/users/referral-stats?page=1&limit=20 → { success, data: { users, pagination } } */
  getMasterUsersReferralStats: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterUsers}/referral-stats${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/users/unassigned?page=1&limit=20 → { success, message, data: { users, pagination } } */
  getMasterUnassignedUsers: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(500, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterUsers}/unassigned${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/users/:userId → { success, data: { user } or user } */
  getMasterUserById: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/users/:userId/referral-stats → { success, data: { referralCode, referredCount, totalCommission } } */
  getMasterUserReferralStats: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/referral-stats`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/users/:userId/support-tickets?page=1&limit=20 → { success, data: { tickets, pagination } } */
  getMasterUserSupportTickets: async (userId, params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/support-tickets${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** PATCH /api/v1/master/users/:userId/freeze → { success, message, data: { user, message } } */
  patchMasterUserFreeze: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/freeze`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, {}, headers);
  },

  /** PATCH /api/v1/master/users/:userId/unfreeze → { success, message, data?: { user } } */
  patchMasterUserUnfreeze: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/unfreeze`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, {}, headers);
  },

  /** PATCH /api/v1/master/users/:userId/suspend → { success, message, data?: { user } } */
  patchMasterUserSuspend: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/suspend`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, {}, headers);
  },

  /** PATCH /api/v1/master/users/:userId/unsuspend → { success, message, data?: { user } } */
  patchMasterUserUnsuspend: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/unsuspend`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, {}, headers);
  },

  /** PATCH /api/v1/master/users/:userId/reactivate → { success, message, data?: { user } } */
  patchMasterUserReactivate: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/reactivate`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, {}, headers);
  },

  /** DELETE /api/v1/master/users/:userId → { success, message } */
  deleteMasterUser: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallDelete(url, headers);
  },

  /** POST /api/v1/master/users/assign-sub-admin – body: { subAdminId, userIds: string[] } → { success, message, data: { subAdminId, branchId, assignedCount, totalRequested } } */
  postMasterUsersAssignSubAdmin: async (subAdminId, userIds) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/assign-sub-admin`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, { subAdminId, userIds: Array.isArray(userIds) ? userIds : [] }, headers);
  },

  /** POST /api/v1/master/users/unassign-sub-admin – body: { subAdminId, userIds: string[] } */
  postMasterUsersUnassignSubAdmin: async (subAdminId, userIds) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/unassign-sub-admin`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, { subAdminId, userIds: Array.isArray(userIds) ? userIds : [] }, headers);
  },

  /** GET /api/v1/master/users/:userId/wallet → { success, data: { wallet } } */
  getMasterUserWallet: async (userId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/wallet`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** POST /api/v1/master/users/:userId/wallet/adjust – body: { type: "credit"|"debit", amount: number (min 1), description?: string (max 500) } */
  postMasterUserWalletAdjust: async (userId, payload) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/wallet/adjust`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, payload, headers);
  },

  /** GET /api/v1/master/users/:userId/transactions?type=deposit|withdrawal&page=1&limit=20 → { success, data: { transactions, pagination } } */
  getMasterUserTransactions: async (userId, params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const q = new URLSearchParams();
    if (params.type) q.set("type", params.type);
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/transactions${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/users/:userId/game-history?page=1&limit=20&gameCode=...&providerCode=... → { success, data: { transactions, pagination } } */
  getMasterUserGameHistory: async (userId, params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterUsers } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    if (params.gameCode) q.set("gameCode", params.gameCode);
    if (params.providerCode) q.set("providerCode", params.providerCode);
    const query = q.toString();
    const url = `${baseUrl}${masterUsers}/${encodeURIComponent(userId)}/game-history${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/casino-game-history?page=1&limit=20&search=...&gameCode=...&providerCode=...&from=...&to=... → { success, data: { list, pagination } } */
  getMasterCasinoGameHistory: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterCasinoGameHistory } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    if (params.search) q.set("search", params.search);
    if (params.gameCode) q.set("gameCode", params.gameCode);
    if (params.providerCode) q.set("providerCode", params.providerCode);
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    const query = q.toString();
    const url = `${baseUrl}${masterCasinoGameHistory}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/games?page=1&limit=20&status=active&search=...&providerCode=...&category=...&sortBy=...&sortOrder=... → { success, data: { games, pagination } } */
  getMasterGames: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterGames } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    if (params.status) q.set("status", params.status);
    if (params.search) q.set("search", params.search);
    if (params.providerCode) q.set("providerCode", params.providerCode);
    if (params.category) q.set("category", params.category);
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    const query = q.toString();
    const url = `${baseUrl}${masterGames}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** PATCH /api/v1/master/games/:gameId/status – body: { status: "active"|"inactive"|"maintenance" } → { status: "success", message, data: { game } } */
  patchMasterGameStatus: async (gameId, status) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterGames } = ApiConfig;
    const url = `${baseUrl}${masterGames}/${gameId}/status`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    const res = await ApiCallPatch(url, { status }, headers);
    if (res?.status === "success") return { success: true, message: res.message, data: res.data };
    return res;
  },

  /** GET /api/v1/master/wallets?page=1&limit=20&search=... → { success, data: { wallets, pagination } } */
  getMasterWallets: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterWallets } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    if (params.search) q.set("search", params.search);
    const query = q.toString();
    const url = `${baseUrl}${masterWallets}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/deposit-account?ownerType=master|branch&branchId=&type=bank|upi&isActive=true|false&page=1&limit=20 → { success, data: { accounts, pagination } } */
  getMasterDepositAccounts: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositAccount } = ApiConfig;
    const q = new URLSearchParams();
    if (params.ownerType) q.set("ownerType", params.ownerType);
    if (params.branchId) q.set("branchId", params.branchId);
    if (params.type) q.set("type", params.type);
    if (params.isActive !== undefined && params.isActive !== null) q.set("isActive", String(params.isActive));
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterDepositAccount}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** POST /api/v1/master/deposit-account – body: type, ownerType, branchId?, bank fields or UPI fields, displayOrder? */
  postMasterDepositAccount: async (body) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositAccount } = ApiConfig;
    const url = `${baseUrl}${masterDepositAccount}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, body, headers);
  },

  /** PUT /api/v1/master/deposit-account/:id – partial update */
  putMasterDepositAccount: async (id, body) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositAccount } = ApiConfig;
    const url = `${baseUrl}${masterDepositAccount}/${encodeURIComponent(id)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPut(url, body, headers);
  },

  /** PATCH /api/v1/master/deposit-account/status/:id – body: { isActive: true|false } */
  patchMasterDepositAccountStatus: async (id, isActive) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositAccount } = ApiConfig;
    const url = `${baseUrl}${masterDepositAccount}/status/${encodeURIComponent(id)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, { isActive }, headers);
  },

  /** DELETE /api/v1/master/deposit-account/:id */
  deleteMasterDepositAccount: async (id) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositAccount } = ApiConfig;
    const url = `${baseUrl}${masterDepositAccount}/${encodeURIComponent(id)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallDelete(url, headers);
  },

  /** GET /api/v1/master/deposit-withdrawal-list?page=1&limit=20 → { success, data: { list, pagination } } */
  getMasterDepositWithdrawalList: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositWithdrawalList } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterDepositWithdrawalList}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/deposits-withdrawals-monthwise → { success, data: [{ month, depositCount?, deposits?, depositAmount?, withdrawalCount?, withdrawals?, withdrawalAmount?, ... }] } */
  getMasterDepositsWithdrawalsMonthwise: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositsWithdrawalsMonthwise } = ApiConfig;
    const q = new URLSearchParams();
    if (params.year != null) q.set("year", params.year);
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    const query = q.toString();
    const url = `${baseUrl}${masterDepositsWithdrawalsMonthwise}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/profit-loss-by-category?from=&to= → { success, data: { data: [{ category, categoryCode, profit, loss, net }], from, to } } */
  getMasterProfitLossByCategory: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterProfitLossByCategory } = ApiConfig;
    const q = new URLSearchParams();
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    const query = q.toString();
    const url = `${baseUrl}${masterProfitLossByCategory}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** PATCH /api/v1/master/transaction-limits – body: { minDepositLimit, maxDepositLimit, bonusPercentage, minWithdrawalLimit, maxWithdrawalLimit } */
  patchMasterTransactionLimits: async (payload) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterTransactionLimits } = ApiConfig;
    const url = `${baseUrl}${masterTransactionLimits}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, payload, headers);
  },

  /** GET /api/v1/master/deposit-requests?status=pending|approved|rejected&page=1&limit=20 (omit status for all) → { success, data: { deposits, pagination } } */
  getMasterDepositRequests: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositRequests } = ApiConfig;
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterDepositRequests}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/deposit-requests/pending?page=1&limit=20 */
  getMasterDepositRequestsPending: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositRequests } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterDepositRequests}/pending${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/deposit-requests/approved?page=1&limit=20 */
  getMasterDepositRequestsApproved: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositRequests } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterDepositRequests}/approved${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/deposit-requests/rejected?page=1&limit=20 */
  getMasterDepositRequestsRejected: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositRequests } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterDepositRequests}/rejected${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/withdrawal-requests?status=pending|approved|rejected&page=1&limit=20 (omit status for all) → { success, data: { withdrawals, pagination } } */
  getMasterWithdrawalRequests: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterWithdrawalRequests } = ApiConfig;
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterWithdrawalRequests}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/withdrawal-requests/pending?page=1&limit=20 */
  getMasterWithdrawalRequestsPending: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterWithdrawalRequests } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterWithdrawalRequests}/pending${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/withdrawal-requests/approved?page=1&limit=20 */
  getMasterWithdrawalRequestsApproved: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterWithdrawalRequests } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterWithdrawalRequests}/approved${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/withdrawal-requests/rejected?page=1&limit=20 */
  getMasterWithdrawalRequestsRejected: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterWithdrawalRequests } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterWithdrawalRequests}/rejected${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/bets/dashboard → { success, data: { totalExposure, totalPL, openBets, settledBets } } */
  getMasterBetsDashboard: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterBets } = ApiConfig;
    const url = `${baseUrl}${masterBets}/dashboard`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/bets/amount-stats → { success, data: { totalBetAmount, todayBetAmount, betAmount7d, betAmount30d } } */
  getMasterBetsAmountStats: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterBets } = ApiConfig;
    const url = `${baseUrl}${masterBets}/amount-stats`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/bets/upline-stats → { success, data: [{ upline, exposure, pl, open, settled }] } */
  getMasterBetsUplineStats: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterBets } = ApiConfig;
    const url = `${baseUrl}${masterBets}/upline-stats`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/bets/downline-stats → { success, data: [{ level, exposure, pl, bets }] } */
  getMasterBetsDownlineStats: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterBets } = ApiConfig;
    const url = `${baseUrl}${masterBets}/downline-stats`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/bets?status=all|open|settled|cancelled&market=&upline=&from=&to=&search=&page=1&limit=20 → { success, data: { bets, total, page, limit } } */
  getMasterBets: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterBets } = ApiConfig;
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.market) q.set("market", params.market);
    if (params.upline) q.set("upline", params.upline);
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    if (params.search) q.set("search", params.search);
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterBets}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** POST /api/v1/master/bets/:betId/settle – body: { result: "win"|"lose" } */
  postMasterBetSettle: async (betId, payload) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterBets } = ApiConfig;
    const url = `${baseUrl}${masterBets}/${encodeURIComponent(betId)}/settle`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, payload, headers);
  },

  /** POST /api/v1/master/bets/:betId/cancel – no body */
  postMasterBetCancel: async (betId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterBets } = ApiConfig;
    const url = `${baseUrl}${masterBets}/${encodeURIComponent(betId)}/cancel`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, {}, headers);
  },

  /** POST /api/v1/master/sub-admin – body: fullName, mobileNumber, emailId, password, branchId?, branchName?, permissions? */
  postMasterSubAdmin: async (body) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const url = `${baseUrl}${masterSubAdmin}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, body, headers);
  },

  /** GET /api/v1/master/sub-admin?page=1&limit=20&isActive=true|false – list sub-admins */
  getMasterSubAdmins: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    if (params.isActive === true || params.isActive === false) q.set("isActive", String(params.isActive));
    const query = q.toString();
    const url = `${baseUrl}${masterSubAdmin}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/sub-admin/:id – view sub-admin details */
  getMasterSubAdminById: async (id) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const url = `${baseUrl}${masterSubAdmin}/${encodeURIComponent(id)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/sub-admin/:subAdminId/assigned-users?page=1&limit=20 → { success, data: { users, subAdminId, pagination } } */
  getMasterSubAdminAssignedUsers: async (subAdminId, params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterSubAdmin}/${encodeURIComponent(subAdminId)}/assigned-users${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** POST /api/v1/master/sub-admin/:id/unassign-users – body: { userIds: string[] } → { success, message, data: { subAdminId, unassignedCount, totalRequested } } */
  postMasterSubAdminUnassignUsers: async (subAdminId, userIds) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const url = `${baseUrl}${masterSubAdmin}/${encodeURIComponent(subAdminId)}/unassign-users`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, { userIds: Array.isArray(userIds) ? userIds : [] }, headers);
  },

  /** PATCH /api/v1/master/sub-admin/:id – edit (fullName, mobileNumber, emailId, password?, branchId?, branchName?, permissions?) */
  patchMasterSubAdmin: async (id, body) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const url = `${baseUrl}${masterSubAdmin}/${encodeURIComponent(id)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, body, headers);
  },

  /** PATCH /api/v1/master/sub-admin/:id/status – body: { isActive: true|false } */
  patchMasterSubAdminStatus: async (id, isActive) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const url = `${baseUrl}${masterSubAdmin}/${encodeURIComponent(id)}/status`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, { isActive }, headers);
  },

  /** DELETE /api/v1/master/sub-admin/:id – soft delete */
  deleteMasterSubAdmin: async (id) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const url = `${baseUrl}${masterSubAdmin}/${encodeURIComponent(id)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallDelete(url, headers);
  },

  /** GET /api/v1/master/sub-admin/settlements/pending?page=1&limit=20 – pending sub-admin settlements */
  getMasterSubAdminSettlementsPending: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterSubAdmin}/settlements/pending${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/sub-admin/settlements/settled?page=1&limit=20 – settled sub-admin settlements */
  getMasterSubAdminSettlementsSettled: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterSubAdmin}/settlements/settled${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/master/sub-admin/settlements/rejected?page=1&limit=20 – rejected sub-admin settlements */
  getMasterSubAdminSettlementsRejected: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${masterSubAdmin}/settlements/rejected${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** PATCH /api/v1/master/sub-admin/settlements/:settlementId/settle – mark settlement as settled */
  patchMasterSubAdminSettlementSettle: async (settlementId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const url = `${baseUrl}${masterSubAdmin}/settlements/${encodeURIComponent(settlementId)}/settle`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, {}, headers);
  },

  /** PATCH /api/v1/master/sub-admin/settlements/:settlementId/reject – body: { rejectReason?: string } */
  patchMasterSubAdminSettlementReject: async (settlementId, body = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterSubAdmin } = ApiConfig;
    const url = `${baseUrl}${masterSubAdmin}/settlements/${encodeURIComponent(settlementId)}/reject`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, body && body.rejectReason ? { rejectReason: body.rejectReason } : {}, headers);
  },

  /** GET /api/v1/support/admin/tickets?search=&status=&page=1&limit=20 – list tickets */
  getSupportAdminTickets: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, supportAdmin } = ApiConfig;
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.status) q.set("status", params.status);
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    const query = q.toString();
    const url = `${baseUrl}${supportAdmin}/tickets${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/support/admin/tickets/:ticketId – ticket detail + messages (marks as read for admin) */
  getSupportAdminTicketDetail: async (ticketId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, supportAdmin } = ApiConfig;
    const url = `${baseUrl}${supportAdmin}/tickets/${encodeURIComponent(ticketId)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** POST /api/v1/support/admin/tickets/:ticketId/reply – body: { message, attachmentUrl?, attachmentName? } */
  postSupportAdminTicketReply: async (ticketId, body) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, supportAdmin } = ApiConfig;
    const url = `${baseUrl}${supportAdmin}/tickets/${encodeURIComponent(ticketId)}/reply`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, body, headers);
  },

  /** PATCH /api/v1/support/admin/tickets/:ticketId/status – body: { status: "resolved" | "closed" } */
  patchSupportAdminTicketStatus: async (ticketId, status) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, supportAdmin } = ApiConfig;
    const url = `${baseUrl}${supportAdmin}/tickets/${encodeURIComponent(ticketId)}/status`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, { status }, headers);
  },

  /** POST /api/v1/master/notifications/send-user – body: { userId, title, message, link? } */
  postMasterNotificationSendUser: async (body) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterNotifications } = ApiConfig;
    const url = `${baseUrl}${masterNotifications}/send-user`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, body, headers);
  },

  /** POST /api/v1/master/notifications/send-bulk – body: { userIds: string[], title, message, link? } */
  postMasterNotificationSendBulk: async (body) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterNotifications } = ApiConfig;
    const url = `${baseUrl}${masterNotifications}/send-bulk`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, body, headers);
  },

  /** POST /api/v1/master/notifications/send-all – body: { title, message, link? } */
  postMasterNotificationSendAll: async (body) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterNotifications } = ApiConfig;
    const url = `${baseUrl}${masterNotifications}/send-all`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, body, headers);
  },

  /** GET /api/v1/master/notifications?page=1&limit=20&status=active|inactive&type=single|bulk|announce */
  getMasterNotifications: async (params = {}) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterNotifications } = ApiConfig;
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", params.page);
    if (params.limit != null) q.set("limit", Math.min(100, Math.max(1, params.limit)));
    if (params.status) q.set("status", params.status);
    if (params.type) q.set("type", params.type);
    const query = q.toString();
    const url = `${baseUrl}${masterNotifications}${query ? `?${query}` : ""}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** PATCH /api/v1/master/withdrawal-requests/:id – body: { status: "approved"|"rejected", userId, rejectReason?, adminRemarks? } */
  patchMasterWithdrawalRequest: async (withdrawalId, payload) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterWithdrawalRequests } = ApiConfig;
    const url = `${baseUrl}${masterWithdrawalRequests}/${encodeURIComponent(withdrawalId)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, payload, headers);
  },

  /** PATCH /api/v1/master/deposit-requests/:id – body: { status: "approved"|"rejected", userId, adminRemarks?, rejectReason? } */
  patchMasterDepositRequest: async (depositId, payload) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl, masterDepositRequests } = ApiConfig;
    const url = `${baseUrl}${masterDepositRequests}/${encodeURIComponent(depositId)}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, payload, headers);
  },

  // ============================================================================
  // BETTING AUTH METHODS
  // ============================================================================

  bettingSendOtp: async (mobile) => {
    const { baseBettingAuth, bettingSendOtp } = ApiConfig;
    const url = baseBettingAuth + bettingSendOtp;
    const params = { mobile };
    const headers = { "Content-Type": "application/json" };
    return ApiCallPost(url, params, headers);
  },

  bettingRegister: async (mobile, otp, password, confirmPassword, referralCode = "") => {
    const { baseBettingAuth, bettingRegister } = ApiConfig;
    const url = baseBettingAuth + bettingRegister;
    const params = { mobile, otp, password, confirmPassword, referralCode };
    const headers = { "Content-Type": "application/json" };
    return ApiCallPost(url, params, headers);
  },

  bettingLogin: async (mobile, password) => {
    const { baseBettingAuth, bettingLogin } = ApiConfig;
    const url = baseBettingAuth + bettingLogin;
    const params = { mobile, password };
    const headers = { "Content-Type": "application/json" };
    return ApiCallPost(url, params, headers);
  },

  bettingRefreshToken: async (refreshToken) => {
    const { baseBettingAuth, bettingRefreshToken } = ApiConfig;
    const url = baseBettingAuth + bettingRefreshToken;
    const params = { refreshToken };
    const headers = { "Content-Type": "application/json" };
    return ApiCallPost(url, params, headers);
  },

  bettingForgotPasswordSendOtp: async (mobile) => {
    const { baseBettingAuth, bettingForgotPasswordSendOtp } = ApiConfig;
    const url = baseBettingAuth + bettingForgotPasswordSendOtp;
    const params = { mobile };
    const headers = { "Content-Type": "application/json" };
    return ApiCallPost(url, params, headers);
  },

  bettingForgotPasswordReset: async (mobile, otp, newPassword, confirmPassword) => {
    const { baseBettingAuth, bettingForgotPasswordReset } = ApiConfig;
    const url = baseBettingAuth + bettingForgotPasswordReset;
    const params = { mobile, otp, newPassword, confirmPassword };
    const headers = { "Content-Type": "application/json" };
    return ApiCallPost(url, params, headers);
  },

  bettingLogout: async () => {
    const token = sessionStorage.getItem("token");
    const { baseBettingAuth, bettingLogout } = ApiConfig;
    const url = baseBettingAuth + bettingLogout;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    return ApiCallPost(url, {}, headers);
  },

  bettingGetMe: async () => {
    const token = sessionStorage.getItem("token");
    const { baseBettingAuth, bettingGetMe } = ApiConfig;
    const url = baseBettingAuth + bettingGetMe;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    return ApiCallGet(url, headers);
  },

  bettingUpdateProfile: async (payload, profileImageFile = null) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingAuth, bettingUpdateProfile } = ApiConfig;
    const url = baseBettingAuth + bettingUpdateProfile;
    const authHeader = `Bearer ${token}`;
    const data = payload && typeof payload === "object" ? payload : {};
    // Always send as FormData (same as deposit) so backend gets consistent multipart body
    const formData = new FormData();
    formData.append("fullName", data.fullName != null ? String(data.fullName).trim() : "");
    formData.append("email", data.email != null ? String(data.email).trim() : "");
    if (profileImageFile) formData.append("profileImage", profileImageFile);
    return ApiCallPutFormData(url, formData, authHeader);
  },

  bettingChangePassword: async (currentPassword, newPassword, confirmPassword) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingAuth, bettingChangePassword } = ApiConfig;
    const url = baseBettingAuth + bettingChangePassword;
    const params = { currentPassword, newPassword, confirmPassword };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    return ApiCallPost(url, params, headers);
  },

  bettingGetDepositOptions: async () => {
    const token = sessionStorage.getItem("token");
    const { baseBettingWallet, bettingDepositOptions } = ApiConfig;
    const url = baseBettingWallet + bettingDepositOptions;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/user/deposit-accounts/master – auth required. Returns { data: { accounts, source } }. (User-facing; admin list uses getMasterDepositAccounts with params.) */
  getUserDepositAccountsMaster: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseUrl } = ApiConfig;
    const path = "/api/v1/user/deposit-accounts/master";
    const url = `${baseUrl}${path}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  bettingGetBalance: async () => {
    const token = sessionStorage.getItem("token");
    const { baseBettingWallet, bettingBalance } = ApiConfig;
    const url = baseBettingWallet + bettingBalance;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/wallet/deposit-transactions – auth required. Returns { data: { transactions, pagination } }. */
  walletDepositTransactions: async (page = 1, limit = 10) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseBettingWallet, bettingDepositTransactions } = ApiConfig;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const url = `${baseBettingWallet}${bettingDepositTransactions}?${params.toString()}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/wallet/withdrawal-transactions – auth required. Returns { data: { transactions, pagination } }. */
  walletWithdrawalTransactions: async (page = 1, limit = 10) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseBettingWallet, bettingWithdrawalTransactions } = ApiConfig;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const url = `${baseBettingWallet}${bettingWithdrawalTransactions}?${params.toString()}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  /** POST /api/v1/wallet/withdrawal – auth required. Body: { accountId, amount, otp, note }. */
  walletWithdrawal: async (accountId, amount, otp, note = "") => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseBettingWallet, bettingWithdrawal } = ApiConfig;
    const url = baseBettingWallet + bettingWithdrawal;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    const payload = {
      accountId,
      amount: Number(amount),
      otp: String(otp || "").trim(),
      note: String(note || "").slice(0, 200),
    };
    return ApiCallPost(url, payload, headers);
  },

  /** POST /api/v1/wallet/send-withdrawal-otp – auth required. Body: empty {}. Sends OTP to user's registered mobile. */
  walletRequestWithdrawalOtp: async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseBettingWallet, bettingSendWithdrawalOtp } = ApiConfig;
    const url = baseBettingWallet + bettingSendWithdrawalOtp;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, {}, headers);
  },

  /** POST /api/v1/wallet/send-withdrawal-otp – auth required. Body: { accountId, amount, otp, note }. Verifies OTP and processes withdrawal. */
  walletSendWithdrawalOtp: async (accountId, amount, note = "", otp = "") => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseBettingWallet, bettingSendWithdrawalOtp } = ApiConfig;
    const url = baseBettingWallet + bettingSendWithdrawalOtp;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    const payload = {
      accountId,
      amount: Number(amount),
      note: String(note || "").slice(0, 200),
      otp: String(otp || "").trim(),
    };
    return ApiCallPost(url, payload, headers);
  },

  bettingCreateDeposit: async (payload, paymentProofFile = null) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingWallet, bettingDeposit } = ApiConfig;
    const url = baseBettingWallet + bettingDeposit;
    const authHeader = `Bearer ${token}`;
    const data = payload && typeof payload === "object" ? payload : {};
    if (paymentProofFile) {
      const formData = new FormData();
      formData.append("amount", String(data.amount ?? ""));
      formData.append("utrNumber", String(data.utrNumber ?? ""));
      formData.append("paymentMethod", String(data.paymentMethod ?? "upi"));
      if (data.remarks != null) formData.append("remarks", String(data.remarks));
      if (data.adminDetailId) formData.append("adminDetailId", String(data.adminDetailId));
      formData.append("paymentProof", paymentProofFile);
      return ApiCallPostFormData(url, formData, authHeader);
    }
    const headers = { "Content-Type": "application/json", Authorization: authHeader };
    return ApiCallPost(url, data, headers);
  },

  /** Uses auth route POST /api/v1/auth/send-otp-bank (same base as signup OTP) */
  bettingBankAccountsSendOtp: async () => {
    const token = sessionStorage.getItem("token");
    const { baseBettingAuth, bettingSendOtpBank } = ApiConfig;
    const url = baseBettingAuth + bettingSendOtpBank;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, {}, headers);
  },

  bettingBankAccountsAdd: async (payload) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingBankAccounts } = ApiConfig;
    const url = baseBettingBankAccounts;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, payload, headers);
  },

  bettingBankAccountsList: async () => {
    const token = sessionStorage.getItem("token");
    const { baseBettingBankAccounts } = ApiConfig;
    const url = baseBettingBankAccounts;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  bettingBankAccountsDelete: async (accountId) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingBankAccounts } = ApiConfig;
    const url = `${baseBettingBankAccounts}/${accountId}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallDelete(url, headers);
  },

  bettingBankAccountsSetDefault: async (accountId) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingBankAccounts } = ApiConfig;
    const url = `${baseBettingBankAccounts}/${accountId}/default`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPatch(url, {}, headers);
  },

  // ---------- Betting Games (WCO – list + launch for iframe) ----------
  bettingGamesGetProviders: async () => {
    const token = sessionStorage.getItem("token");
    const { baseBettingGames, bettingGamesProviders } = ApiConfig;
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return ApiCallGet(baseBettingGames + bettingGamesProviders, headers);
  },
  bettingGamesGetCategories: async () => {
    const token = sessionStorage.getItem("token");
    const { baseBettingGames, bettingGamesCategories } = ApiConfig;
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return ApiCallGet(baseBettingGames + bettingGamesCategories, headers);
  },
  bettingGamesByCategory: async (category, page = 1, limit = 20, search = "") => {
    const token = sessionStorage.getItem("token");
    const { baseBettingGames } = ApiConfig;
    const params = new URLSearchParams({ page, limit });
    if (search) params.set("search", search);
    const url = `${baseBettingGames}category/${encodeURIComponent(category)}?${params}`;
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return ApiCallGet(url, headers);
  },
  bettingGamesByProvider: async (providerCode, page = 1, limit = 20, search = "") => {
    const token = sessionStorage.getItem("token");
    const { baseBettingGames } = ApiConfig;
    const params = new URLSearchParams({ page, limit });
    if (search) params.set("search", search);
    const url = `${baseBettingGames}provider/${encodeURIComponent(providerCode)}?${params}`;
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return ApiCallGet(url, headers);
  },
  /** GET /api/v1/games?providerCode=&category=&page=1&limit=20. providerCode "all" (case-insensitive) → "ALL" (no provider filter). */
  bettingGamesList: async (providerCode, category = "all", page = 1, limit = 20) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingGames } = ApiConfig;
    const normalizedProvider = providerCode && String(providerCode).toLowerCase() === "all" ? "ALL" : providerCode;
    const params = new URLSearchParams({ providerCode: normalizedProvider, page, limit: Math.min(limit, 50) });
    if (category && category !== "all") params.set("category", category);
    const base = baseBettingGames.replace(/\/$/, "");
    const url = `${base}?${params}`;
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return ApiCallGet(url, headers);
  },
  bettingGamesFeatured: async (limit = 20) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingGames, bettingGamesFeatured } = ApiConfig;
    const url = `${baseBettingGames}${bettingGamesFeatured}?limit=${limit}`;
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return ApiCallGet(url, headers);
  },
  bettingGamesPopular: async (limit = 20) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingGames, bettingGamesPopular } = ApiConfig;
    const url = `${baseBettingGames}${bettingGamesPopular}?limit=${limit}`;
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return ApiCallGet(url, headers);
  },
  /** GET /api/v1/games/landing – no auth. Returns liveCasino, slots, trending, roulette, cardGames. */
  bettingGamesLanding: async () => {
    const { baseBettingGames, bettingGamesLanding } = ApiConfig;
    const url = baseBettingGames + bettingGamesLanding;
    const headers = { "Content-Type": "application/json" };
    return ApiCallGet(url, headers);
  },
  /** Launch game – returns launchURL for iframe. Requires login. */
  bettingGamesLaunch: async (gameCode, providerCode, platform = "desktop") => {
    const token = sessionStorage.getItem("token");
    console.log("🚀 ~ token:", token)
    if (!token) return { success: false, message: "Login required to play" };
    const { baseBettingGames, bettingGamesLaunch } = ApiConfig;
    const url = baseBettingGames + bettingGamesLaunch;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallPost(url, { gameCode, providerCode, platform }, headers);
  },

  /** GET /api/v1/sportsbook/{sportName}/matches – sportName: cricket, soccer, tennis. Auth: Bearer token. */
  sportsbookMatches: async (sportName) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingSportsbook } = ApiConfig;
    const url = `${baseBettingSportsbook}/${encodeURIComponent(sportName)}/matches`;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/sportsbook/{sportName}/odds?gameId={gameId} – Returns matchOdds, bookMakerOdds, fancyOdds, premiumFancy. Auth: Bearer token. */
  sportsbookOdds: async (sportName, gameId) => {
    const token = sessionStorage.getItem("token");
    const { baseBettingSportsbook } = ApiConfig;
    const url = `${baseBettingSportsbook}/${encodeURIComponent(sportName)}/odds?gameId=${encodeURIComponent(gameId)}`;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return ApiCallGet(url, headers);
  },

  /** GET /api/v1/games/transactions?page=1&limit=20 – auth required. Returns { data: { transactions, pagination } }. */
  gamesTransactions: async (page = 1, limit = 20) => {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, message: "Login required" };
    const { baseBettingGames, bettingGamesTransactions } = ApiConfig;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const url = `${baseBettingGames}${bettingGamesTransactions}?${params.toString()}`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    return ApiCallGet(url, headers);
  },

  // ============================================================================
  // END OF BETTING AUTH METHODS
  // ============================================================================

}

export default AuthService;
