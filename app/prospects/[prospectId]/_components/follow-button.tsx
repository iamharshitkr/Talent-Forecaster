'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { SubmitButton } from "./submit-follow-button";
import { followProspectAction } from "@/actions/follow-prospect.action";

interface Props {
  prospectId: string;
  favoriteProspects: string[];
}

function FollowButton({ prospectId, favoriteProspects }: Props) {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(favoriteProspects.includes(prospectId));
  const [formState, setFormState] = useState({ status: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (formState.status === "success") {
      toast({ title: formState.message });
    }
  }, [formState, toast]);

  const handleFollowAction = async () => {
    if (!userId) {
      toast({ title: "You must be signed in to follow a prospect." });
      return;
    }

    setLoading(true);
    try {
      const result = await followProspectAction(userId, prospectId, isFavorite);
      setFormState(result);
      if (result.status === "success") {
        setIsFavorite(result.isFavorite);
      }
    } catch (error) {
      toast({ title: "Something went wrong. Please try again."});
    } finally {
      setLoading(false);
    }
  };

  return userId ? (
    <form onSubmit={(e) => { e.preventDefault(); handleFollowAction(); }}>
      <Input type="hidden" name="prospectId" value={prospectId} />
      <SubmitButton isFavorite={isFavorite} />
    </form>
  ) : (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 text-white">
          <Heart className="w-6 h-6" />
          Follow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Sign in to follow</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center">You must be signed in to follow a prospect.</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export { FollowButton };
