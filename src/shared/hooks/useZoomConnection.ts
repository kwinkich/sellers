import { useMutation } from "@tanstack/react-query";
import { adminsMutationOptions } from "@/entities/admin/model/api/admin.api";
import { openExternalUrl } from "@/shared/lib/telegram";

/**
 * Custom hook for handling Zoom connection
 * Uses Telegram WebApp API when available, falls back to regular browser behavior
 */
export function useZoomConnection() {
  const connectMutation = useMutation({
    ...adminsMutationOptions.zoomConnect(),
    onSuccess: (response) => {
      if (response.data?.authUrl) {
        // Open the Zoom auth URL using Telegram WebApp API or fallback
        openExternalUrl(response.data.authUrl);
      }
    },
    onError: (error) => {
      console.error("Failed to get Zoom auth URL:", error);
    },
  });

  const connectToZoom = () => {
    connectMutation.mutate();
  };

  return {
    connectToZoom,
    isConnecting: connectMutation.isPending,
    error: connectMutation.error,
  };
}
