"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getFirestore, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { app } from "@/app/firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { User } from "firebase/auth";

interface StarRatingProps {
  prospectId: string;
  totalStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ prospectId, totalStars = 5 }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [totalStarsGiven, setTotalStarsGiven] = useState<number>(0); // Total stars given for the prospect
  const [user, setUser] = useState<User | null>(null);
  const db = getFirestore(app);
  const auth = getAuth();
  const { toast } = useToast();

  // Listen for changes to the user's authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch the prospect data and calculate the average rating
  useEffect(() => {
    const fetchProspectRating = async () => {
      const docRef = doc(db, "prospects", prospectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const ratings: number[] = data?.ratings || [];
        const totalRatings = ratings.length;
        const avgRating = totalRatings > 0 ? ratings.reduce((a, b) => a + b, 0) / totalRatings : 0;
        const totalStarsGiven = ratings.reduce((a, b) => a + b, 0); // Sum of all ratings (total stars given)
        
        setRatingCount(totalRatings);
        setAverageRating(avgRating);
        setTotalStarsGiven(totalStarsGiven); // Store total stars given
      }
    };

    fetchProspectRating();
  }, [db, prospectId]);

  const handleRating = async (starIndex: number) => {
    if (!user) {
      toast({ title: "Please log in to submit a Rating." });
      return;
    }

    setRating(starIndex);

    try {
      const docRef = doc(db, "prospects", prospectId);
      const docSnap = await getDoc(docRef); // Check if the document exists

      if (!docSnap.exists()) {
        // If the document doesn't exist, create it with the first rating
        await setDoc(docRef, {
          ratings: [starIndex], // Initialize with the first rating
        });
        toast({ title: `Thanks for rating!` });

        setRatingCount(1); // Set the rating count to 1
        setAverageRating(starIndex); // Set the average rating to the first rating
        setTotalStarsGiven(starIndex); // Set the total stars to the first rating
      } else {
        // If the document exists, check if the user has already rated
        const ratings: number[] = docSnap.data()?.ratings || [];
        const userRating = ratings.find((rating) => rating === starIndex);

        if (userRating) {
          toast({ title: "You've already rated this prospect." });
          return;
        }

        // If the user hasn't rated yet, update the document with the new rating
        await updateDoc(docRef, { ratings: arrayUnion(starIndex) });
        toast({ title: `Thanks for rating!` });

        setRatingCount((prevCount) => prevCount + 1);
        setTotalStarsGiven((prevTotal) => prevTotal + starIndex);
        setAverageRating((prevAverage) => (prevAverage * ratingCount + starIndex) / (ratingCount + 1));
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      toast({ title: "Error saving your rating. Please try again." });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-1">
        {Array.from({ length: totalStars }, (_, index) => (
          <Star
            key={index}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              (hoverRating ?? averageRating) > index ? "text-yellow-400" : "text-gray-400"
            }`}
            onClick={() => handleRating(index + 1)}
            onMouseEnter={() => setHoverRating(index + 1)}
            onMouseLeave={() => setHoverRating(null)}
          />
        ))}
      </div>

      <div className="text-sm text-gray-600">
        <div className="text-sm text-white">
          Average Rating: <span className="font-semibold">{averageRating.toFixed(1)}</span> / {totalStars}
        </div>
        <div className="text-sm text-white">
          Total Stars Given: <span className="font-semibold">{totalStarsGiven}</span>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <div className="text-sm text-white">
          {ratingCount} user{ratingCount === 1 ? " has" : "s have"} rated this prospect.
        </div>
      </div>
    </div>
  );
};

export default StarRating;
