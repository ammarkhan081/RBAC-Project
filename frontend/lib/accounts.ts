import { UserRole } from "./types";

export interface RegisteredAccount {
  username: string;
  role: UserRole;
  pass: string;
  email: string;
}

export const DEMO_USERS: RegisteredAccount[] = [
  { username: "Tony", role: "Engineering", pass: "eng123", email: "tony@enterprise.finsolve.io" },
  { username: "Bruce", role: "Marketing", pass: "mkt123", email: "bruce@enterprise.finsolve.io" },
  { username: "Sam", role: "Finance", pass: "fin123", email: "sam@enterprise.finsolve.io" },
  { username: "Natasha", role: "HR", pass: "hr123", email: "natasha@enterprise.finsolve.io" },
  { username: "Admin", role: "C-Level", pass: "admin123", email: "admin@enterprise.finsolve.io" },
  { username: "Nolan", role: "General", pass: "gen123", email: "nolan@enterprise.finsolve.io" },
];

const ACCOUNTS_KEY = "secure_registered_accounts";

export interface AuthResult {
  ok: boolean;
  error?: string;
  account?: RegisteredAccount;
}

function readRawAccounts(): RegisteredAccount[] {
  if (typeof window === "undefined") return [...DEMO_USERS];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: RegisteredAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getRegisteredAccounts(): RegisteredAccount[] {
  const accounts = readRawAccounts();
  let changed = accounts.length === 0;
  for (const demo of DEMO_USERS) {
    const exists = accounts.some(
      (account) => account.email.toLowerCase() === demo.email.toLowerCase()
    );
    if (!exists) {
      accounts.push(demo);
      changed = true;
    }
  }
  if (changed) writeAccounts(accounts);
  return accounts;
}

function findAccount(emailOrUsername: string): RegisteredAccount | undefined {
  const key = emailOrUsername.trim().toLowerCase();
  return getRegisteredAccounts().find(
    (account) =>
      account.email.toLowerCase() === key || account.username.toLowerCase() === key
  );
}

export function authenticateAccount(emailOrUsername: string, password: string): AuthResult {
  const account = findAccount(emailOrUsername);
  if (!account) {
    return {
      ok: false,
      error: "No account found for this email. Create an account first.",
    };
  }
  if (account.pass !== password) {
    return { ok: false, error: "Incorrect password." };
  }
  return { ok: true, account };
}

export function registerAccount(input: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: UserRole;
}): AuthResult {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email is required." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const accounts = getRegisteredAccounts();
  const exists = accounts.some((account) => account.email.toLowerCase() === email);
  if (exists) {
    return { ok: false, error: "An account with this email already exists. Please log in." };
  }

  const username =
    [input.firstName, input.lastName].filter(Boolean).join(" ").trim() ||
    email.split("@")[0] ||
    "NewAnalyst";

  const account: RegisteredAccount = {
    username,
    email,
    pass: input.password,
    role: input.role,
  };
  accounts.push(account);
  writeAccounts(accounts);
  return { ok: true, account };
}

export function getAccountPassword(username: string): string | undefined {
  const account = findAccount(username);
  return account?.pass;
}
