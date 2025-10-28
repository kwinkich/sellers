import { AuthAPI } from "@/entities/auth/model/api/auth.api";
import { updateAuthToken } from "@/shared/lib/getAuthToken";
import { generateMockInitData } from "@/shared/lib/mockInitData";
import {
  canUserSwitchAccounts,
  getBotToken,
  isUserSwitchingEnabled,
} from "@/shared/lib/userSwitching";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserRole } from "@/shared/contexts/UserRoleContext";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast.utils";
import { Loader2, Users } from "lucide-react";

interface UserSwitcherProps {
  className?: string;
}

export function UserSwitcher({ className }: UserSwitcherProps) {
  const {} = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tgId, setTgId] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user data to check if they can switch
  const currentUser =
    queryClient.getQueryData<{ data: { user: { username: string } } }>([
      "auth",
      "telegram",
    ]) ||
    queryClient.getQueryData<{ data: { user: { username: string } } }>([
      "auth",
      "refresh",
    ]);

  const currentUsername = currentUser?.data?.user?.username;

  // Don't render if user switching is not enabled or user is not allowed
  if (
    !isUserSwitchingEnabled() ||
    !currentUsername ||
    !canUserSwitchAccounts(currentUsername)
  ) {
    return null;
  }

  const handleSwitchUser = async () => {
    if (!tgId || !username) {
      showErrorToast("Please enter both Telegram ID and username");
      return;
    }

    const botToken = getBotToken();
    if (!botToken) {
      showErrorToast("Bot token not configured");
      return;
    }

    setIsLoading(true);

    try {
      // Generate mock initData with proper HMAC-SHA256
      const initData = await generateMockInitData({
        botToken,
        tgId: parseInt(tgId, 10),
        username,
        firstName: firstName || "Test",
        lastName: lastName || "User",
      });

      // Authenticate with the new initData
      const response = await AuthAPI.authTelegramWithInitData(initData);

      if (response.data) {
        // Update auth token and user data
        updateAuthToken(response.data.accessToken);

        // Invalidate all queries to refresh data
        await queryClient.invalidateQueries();

        // Close dialog
        setIsOpen(false);

        // Reset form
        setTgId("");
        setUsername("");
        setFirstName("");
        setLastName("");

        // Show success message
        showSuccessToast(
          `Switched to user: ${response.data.user.displayName} (@${response.data.user.username})`
        );

        // Redirect based on new user role
        const routes = {
          CLIENT: "/client/home",
          ADMIN: "/admin/home",
          MOP: "/mop/home",
        } as const;

        const targetRoute =
          routes[response.data.user.role as keyof typeof routes];
        if (targetRoute) {
          navigate(targetRoute, { replace: true });
        }
      }
    } catch (error) {
      console.error("Failed to switch user:", error);
      showErrorToast("Failed to switch user. Please check the credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSwitchUser();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="bordered"
          size="sm"
          className={`gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 ${className}`}
          title="Switch User (Dev Only)"
        >
          <Users className="h-4 w-4" />
          Switch User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Switch User Account
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Enter the Telegram ID and username of the account you want to switch
            to.
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tgId">Telegram ID *</Label>
              <Input
                id="tgId"
                type="number"
                placeholder="123456789"
                value={tgId}
                onChange={(e) => setTgId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSwitchUser}
              disabled={isLoading || !tgId || !username}
              className="gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Switching..." : "Switch User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
