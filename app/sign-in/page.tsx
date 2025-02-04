'use client';

import { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signInWithEmailAndPassword, , loadingEmail, errorEmail] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  // Explicitly define the state to accept a User object or null
  const [user, setUser] = useState<User | null>(null);

  // This hook will track the auth state across page reloads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the user object
        sessionStorage.setItem('user', 'true'); // Set session when user logs in
        router.push('/');
      } else {
        setUser(null); // Reset user state on logout
        sessionStorage.removeItem('user'); // Remove session on logout
      }
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async () => {
    try {
      const res = await signInWithEmailAndPassword(email, password);
      if (res) {
        console.log({ res });
        sessionStorage.setItem('user', 'true');
        setEmail('');
        setPassword('');
        router.push('/');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to sign in. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);

      if (res) {
        const user = res.user;

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            signInMethod: 'Google',
            lastSignIn: new Date().toISOString(),
          });
        } else {
          await setDoc(
            userRef,
            { lastSignIn: new Date().toISOString() },
            { merge: true }
          );
        }

        console.log({ res });
        sessionStorage.setItem('user', 'true');
        router.push('/');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const errorMessage = errorEmail?.message || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign In</h1>

        {errorMessage && <div className="bg-red-500 text-white p-2 rounded mb-4">{errorMessage}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <button
          onClick={handleSignIn}
          disabled={loadingEmail}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loadingEmail ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="my-4 text-center text-white">or</div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full p-3 bg-red-600 rounded text-white hover:bg-red-500"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;
