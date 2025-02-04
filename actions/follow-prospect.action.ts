import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../app/firebase/config";

export async function followProspectAction(userId: string, prospectId: string, isFavorite: boolean) {
  try {
    const userDocRef = doc(db, "users", userId);

    // Check if the user document exists
    const userDocSnapshot = await getDoc(userDocRef);
    if (!userDocSnapshot.exists()) {
      // Create the document if it doesn't exist
      await setDoc(userDocRef, {
        favorites: [],
        favoriteStatus: {},
      });
    }

    if (isFavorite) {
      // Unfollow: Remove prospectId from the favorites array and update favoriteStatus
      await updateDoc(userDocRef, {
        favorites: arrayRemove(prospectId),
        [`favoriteStatus.${prospectId}`]: false, // Set isFavorite to false
      });
      return {
        status: "success",
        isFavorite: false, // Reflect the updated status
        message: "Prospect unfollowed successfully",
      };
    } else {
      // Follow: Add prospectId to the favorites array and update favoriteStatus
      await updateDoc(userDocRef, {
        favorites: arrayUnion(prospectId),
        [`favoriteStatus.${prospectId}`]: true, // Set isFavorite to true
      });
      return {
        status: "success",
        isFavorite: true, // Reflect the updated status
        message: "Prospect followed successfully",
      };
    }
  } catch (error) {
    console.error("Error updating favorites", error);
    return {
      status: "error",
      isFavorite: !isFavorite,
      message: "Failed to update favorites",
    };
  }
}
