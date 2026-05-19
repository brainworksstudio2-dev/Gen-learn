import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || ''
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed. Please check your environment variables.", error);
}

export { auth, db };

const provider = new GoogleAuthProvider();
// Request Workspace scopes
provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might be lost on refresh, need to re-sign in or handle refresh
        // For now, we'll just clear and show login
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (desiredRole: 'student' | 'admin' = 'student'): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    const { user: firebaseUser } = result;
    
    // Check if profile exists in Firestore
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const profileSnap = await getDoc(profileRef);
    
    let dbUser;
    if (!profileSnap.exists()) {
      // Create profile for new user
      dbUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous User',
        email: firebaseUser.email || '',
        role: desiredRole,
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date().toISOString(),
      };
      await setDoc(profileRef, dbUser);
    } else {
      dbUser = profileSnap.data();
      // If logging in as admin but previously was student, or vice versa, 
      // we might want to prevent or update. 
      // We don't auto-promote here anymore. 
      // Promotion to admin happens after successful PIN entry in AdminLogin.tsx
      
    }

    localStorage.setItem('user', JSON.stringify(dbUser));
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      console.error('Domain not authorized in Firebase Console:', window.location.hostname);
      toast.error('This domain is not authorized in your Firebase Project. Please add ' + window.location.hostname + ' to Authorized Domains in Firebase Auth settings.');
    } else {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Sign in failed');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const promoteCurrentUserToAdmin = async () => {
  if (auth.currentUser) {
    const profileRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(profileRef, { role: 'admin' }, { merge: true });
    
    // Update local storage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.role = 'admin';
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
