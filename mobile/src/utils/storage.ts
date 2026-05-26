import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getStoredUser(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(USER_KEY);
  } catch {
    return null;
  }
}

export async function setStoredUser(user: string): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, user);
}

export async function removeStoredUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}
