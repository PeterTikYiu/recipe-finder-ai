import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigValid = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

let app;
let auth;
let disabled = false;

export function initAuth() {
  if (!isConfigValid) {
    if (!disabled) {
      // Only warn once
      console.warn('Firebase Auth disabled: missing or invalid environment configuration.');
    }
    disabled = true;
    return null;
  }
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
    } catch (e) {
      console.warn('Firebase Auth initialization failed; auth features disabled.', e);
      disabled = true;
      auth = null;
      return null;
    }
  }
  return auth;
}

export function subscribeAuth(callback) {
  const a = initAuth();
  if (!a || disabled) {
    // Call back on next tick with no user so UI can render without auth
    const id = setTimeout(() => callback(null), 0);
    return () => clearTimeout(id);
  }
  return onAuthStateChanged(a, (user) => callback(user));
}

export async function signInWithGoogle() {
  const a = initAuth();
  if (!a || disabled) {
    return Promise.reject(new Error('Authentication is not configured. Add Firebase env vars to enable sign-in.'));
  }
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(a, provider);
  return res.user;
}

export async function signOutUser() {
  const a = initAuth();
  if (!a || disabled) return;
  await signOut(a);
}

export function getAuthInstance() {
  initAuth();
  return auth;
}

export default { initAuth, subscribeAuth, signInWithGoogle, signOutUser, getAuthInstance };
