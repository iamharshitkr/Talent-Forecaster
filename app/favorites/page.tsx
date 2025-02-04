'use client';

import { useState, useEffect } from 'react';
import { columns } from '@/components/tables/prospects/columns';
import { DataTable } from '@/components/tables/prospects/data-table';
// import { db } from '@/lib/firebase/firestore'; // Ensure this is correctly imported
import { auth } from '@/app/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {firebaseConfig, app, db} from '@/app/firebase/config';

async function getFavorites(): Promise<{ prospects: any[] }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('No user is logged in.');
      return { prospects: [] };
    }

    console.log('Fetching favorites for user:', user.uid); // Debug log

    // Get the user's favorites document from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn('User document does not exist.');
      return { prospects: [] };
    }

    // 🔹 Correctly accessing the "favorites" field from Firestore
    const { favorites = [] } = userDoc.data() || {};

    if (favorites.length === 0) {
      console.warn('No favorite prospects found in Firestore.');
      return { prospects: [] };
    }

    console.log('Favorite Prospects:', favorites); // Debugging

    // Fetch the prospect data from the MLB API
    const prospects = await Promise.all(
      favorites.map(async (prospectId: string) => {
        try {
          const peopleResponse = await fetch(`https://statsapi.mlb.com/api/v1/people/${prospectId}`);
          const peopleData = await peopleResponse.json();

          if (!peopleData?.people || peopleData.people.length === 0) {
            console.warn(`No data found for prospect ID: ${prospectId}`);
            return null;
          }

          const draftResponse = await fetch(
            `https://statsapi.mlb.com/api/v1/draft/${peopleData.people[0].draftYear}/?playerId=${prospectId}`
          );
          const draftData = await draftResponse.json();

          return draftData?.drafts?.rounds[0]?.picks[0] || null;
        } catch (error) {
          console.error(`Error fetching data for prospect ${prospectId}:`, error);
          return null;
        }
      })
    );

    // Filter out null values
    return { prospects: prospects.filter(Boolean) };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { prospects: [] };
  }
}

export default function FavoritesPage() {
  const [favoritesData, setFavoritesData] = useState<{ prospects: any[] }>({ prospects: [] });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const data = await getFavorites(authUser.uid);
  
        // Sort the prospects in ascending order (oldest first)
        data.prospects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
        // Reverse the sorted array to display from bottom to top
        data.prospects.reverse();
  
        setFavoritesData(data);
      } else {
        console.warn('No user is logged in.');
        setUser(null);
        setFavoritesData({ prospects: [] });
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white">Loading your favorite prospects...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl min-h-lvh mt-4">
      {favoritesData.prospects.length > 0 ? (
        <DataTable
          isFavorites={true}
          columns={columns}
          initialData={favoritesData.prospects}
          heading="My Favorites"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-lg text-gray-400">You have no favorite prospects yet.</p>
        </div>
      )}
    </div>
  );
}
