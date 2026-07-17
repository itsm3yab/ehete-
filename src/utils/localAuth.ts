import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ehete_accounts_v1';

export type LocalAccount = {
  username: string;
  phone: string;
  password: string;
};

function normalizeId(value: string) {
  return value.trim().toLowerCase();
}

async function loadAccounts(): Promise<LocalAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAccounts(accounts: LocalAccount[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export async function registerAccount(input: {
  username: string;
  phone: string;
  password: string;
}): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  const username = input.username.trim();
  const phone = input.phone.trim().replace(/\s+/g, '');
  const password = input.password;

  if (username.length < 2) {
    return { ok: false, error: 'Username must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    return {
      ok: false,
      error: 'Username can only use letters, numbers, dots, and underscores.',
    };
  }
  if (phone.length < 9) {
    return { ok: false, error: 'Enter a valid phone number.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const accounts = await loadAccounts();
  const userKey = normalizeId(username);
  const phoneKey = normalizeId(phone);

  if (accounts.some((a) => normalizeId(a.username) === userKey)) {
    return { ok: false, error: 'That username is already taken.' };
  }
  if (accounts.some((a) => normalizeId(a.phone) === phoneKey)) {
    return { ok: false, error: 'That phone number is already registered.' };
  }

  accounts.push({ username, phone, password });
  await saveAccounts(accounts);
  return { ok: true, username };
}

export async function loginAccount(
  identifier: string,
  password: string
): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  const id = identifier.trim();
  if (!id || !password) {
    return { ok: false, error: 'Enter your phone/username and password.' };
  }

  const accounts = await loadAccounts();
  const key = normalizeId(id);
  const match = accounts.find(
    (a) => normalizeId(a.username) === key || normalizeId(a.phone) === key
  );

  if (!match || match.password !== password) {
    return { ok: false, error: 'Incorrect phone/username or password.' };
  }

  return { ok: true, username: match.username };
}
