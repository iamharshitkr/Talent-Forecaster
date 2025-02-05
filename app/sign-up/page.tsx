'use client';

import { useState } from 'react';
// import { useRouter } from 'next/router';
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase/config';

const SignUpWithEmailAndPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();


  const createUser = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await sendEmailVerification(userCredential.user);

      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email,
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString(),
      });

      setEmailSent(true);
      setError(null);

      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (e) {
      console.error(e);
      setError('Failed to create user. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign Up with Email and Password</h1>

        {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}

        {!emailSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <button
              onClick={createUser}
              className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
            >
              Create Account
            </button>
          </>
        ) : (
          <p className="text-green-500 text-center">
            A verification link has been sent to your email. Please check your inbox to verify your account. You will be redirected to the sign-in page shortly.
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUpWithEmailAndPassword;
