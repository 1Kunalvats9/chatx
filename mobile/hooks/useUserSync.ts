import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { useAuth } from "@clerk/clerk-expo";
import { useApiClient, userApi } from "../utils/api";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();
  const queryClient = useQueryClient(); // <-- Get the query client instance here

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: (response: any) => {
      console.log("User synced successfully:", response.data.user);
      // *** THIS IS THE CRITICAL LINE YOU NEEDED TO ADD ***
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); // Invalidate the query used by useCurrentUser
    },
    onError: (error) => console.error("User sync failed:", error),
  });

  // auto-sync user when signed in
  useEffect(() => {
    // If user is signed in and user is not synced yet, sync user
    // Added a check for isPending to prevent multiple immediate calls
    if (isSignedIn && !syncUserMutation.data && !syncUserMutation.isPending) {
      console.log("Attempting to auto-sync user...");
      syncUserMutation.mutate();
    }
  }, [isSignedIn, syncUserMutation.data, syncUserMutation.isPending]); // Add isPending to dependencies

  return null;
};