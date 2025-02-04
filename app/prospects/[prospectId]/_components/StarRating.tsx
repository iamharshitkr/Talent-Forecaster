"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getFirestore, setDoc, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { app } from "@/app/firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface StarRatingProps {
  prospectId: string;
  totalStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ prospectId, totalStars = 5 }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [user, setUser] = useState<firebase.User | null>(null);
  const db = getFirestore(app);
  const auth = getAuth();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    // Fetch the prospect data from Firestore
    const fetchProspectRating = async () => {
      const docRef = doc(db, "prospects", prospectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const ratings: number[] = data?.ratings || [];
        const totalRatings = ratings.length;
        const avgRating = totalRatings > 0 ? ratings.reduce((a, b) => a + b, 0) / totalRatings : 0;
        setRatingCount(totalRatings);
        setAverageRating(avgRating);
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
      await updateDoc(docRef, { ratings: arrayUnion(starIndex) });
      toast({ title: `Thanks for rating!` });

      setRatingCount((prevCount) => prevCount + 1);
      setAverageRating((prevAverage) => (prevAverage * ratingCount + starIndex) / (ratingCount + 1));
    } catch (error) {
      console.error("Error saving rating:", error);
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
        <div className='text-sm text-white'>Average Rating: <span className='font-semibold'>{averageRating.toFixed(1)}</span> / {totalStars}</div>
      </div>
      <div className="text-sm text-gray-600">
        <div className='text-sm text-white'>{ratingCount} user{ratingCount === 1 ? ' has' : 's have'} rated this prospect.</div>
      </div>
    </div>
  );
};

export default StarRating;
