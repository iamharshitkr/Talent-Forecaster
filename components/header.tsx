'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/app/firebase/config'; // Ensure Firebase is initialized in this file
import Logo from '@/components/logo';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Header() {
  // State to manage user authentication
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Handle user sign-out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <header>
      <nav className="bg-mlb-primary border-gray-200 px-4 lg:px-6 py-2.5 ">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Logo />

          <div className="flex items-center lg:order-2">
            <div className="flex items-center gap-4">
              {isLoaded ? (
                user ? (
                  // If user is signed in
                  <>
                    <Link href="/favorites" className="underline text-white">
                      My Favorites
                    </Link>
                    <Button onClick={handleSignOut}>Sign Out</Button>
                  </>
                ) : (
                  // If user is not signed in
                  <>
                    <Link href="/sign-in">
                      <Button>Sign In</Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button>Sign Up</Button>
                    </Link>
                  </>
                )
              ) : (
                // Skeleton Loader while checking auth state
                <Skeleton className="w-[100px] h-[36px] rounded bg-primary" />
              )}

              {/* Mode Toggle (Dark/Light Mode) */}
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
