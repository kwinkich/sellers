import { Separator } from "@/components/ui/separator";
import type { LicenseInfo } from "@/entities";
import { Badge, Box } from "@/shared";
import { format } from "date-fns";
import { X } from "lucide-react";
import type { FC } from "react";

interface LicenseCardProps {
  data: LicenseInfo;
  onRemove?: (licenseId: number) => void;
  isRemoving?: boolean;
}

export const LicenseCard: FC<LicenseCardProps> = ({
  data,
  onRemove,
  isRemoving = false,
}) => {
  const getMopDisplayName = (assignedUser: LicenseInfo["assignedUser"]) => {
    if (!assignedUser) return "Неизвестно";

    const displayName = assignedUser.displayName?.trim();
    const telegramUsername = assignedUser.telegramUsername?.trim();

    if (displayName && displayName.length > 0) return displayName;
    if (telegramUsername && telegramUsername.length > 0)
      return telegramUsername;

    return "Неизвестно";
  };

  const getBadgeVariant = (status: LicenseInfo["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "main";
      case "NOT_ACTIVE":
        return "gray";
      case "EXPIRED":
        return "red-opacity";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: LicenseInfo["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Активна";
      case "NOT_ACTIVE":
        return "Не активна";
      case "EXPIRED":
        return "Истекла";
      default:
        return status;
    }
  };

  const getExpirationDate = () => {
    const today = new Date();
    const expirationDate = new Date(today);
    // Convert seconds to days and add to today's date
    const daysFromSeconds = Math.floor(data.durationSeconds / (24 * 60 * 60));
    expirationDate.setDate(today.getDate() + daysFromSeconds);
    return format(expirationDate, "dd.MM.yyyy");
  };

  const getExpiredDate = () => {
    const today = new Date();
    // For expired licenses, just return today's date
    return format(today, "dd.MM.yyyy");
  };

  return (
    <Box variant="dark" className="gap-3 p-4" justify="start" align="start">
      <div className="flex items-center justify-between w-full">
        <p className="text-lg font-medium text-white">Лицензия #{data.id}</p>
        <div className="flex items-center gap-2">
          <Badge
            label={getStatusText(data.status)}
            variant={getBadgeVariant(data.status) as any}
            title={data.status === "EXPIRED" ? "Истекла" : undefined}
          />
          {onRemove && (
            <button
              onClick={() => onRemove(data.id)}
              disabled={isRemoving}
              className="
								p-1 rounded-full hover:bg-white/10 transition-colors
								disabled:opacity-50 disabled:cursor-not-allowed
								flex items-center justify-center
							"
              title="Удалить лицензию"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      </div>

      <Separator className="bg-[#FFFFFF1A]" />

      <div className="w-full space-y-2">
        {data.status === "EXPIRED" ? (
          <div className="flex justify-between items-center">
            <p className="text-sm text-base-gray">
              Истекла: <span className="text-white">{getExpiredDate()}</span>
            </p>
            {data.assignedUser && (
              <p className="text-sm text-base-gray">
                МОП:{" "}
                <span className="text-white">
                  {getMopDisplayName(data.assignedUser)}
                </span>
              </p>
            )}
          </div>
        ) : data.status === "ACTIVE" ? (
          <div className="flex justify-between items-center">
            <p className="text-sm text-base-gray">
              До: <span className="text-white">{getExpirationDate()}</span>
            </p>
            {data.assignedUser && (
              <p className="text-sm text-base-gray">
                МОП:{" "}
                <span className="text-white">
                  {getMopDisplayName(data.assignedUser)}
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-sm text-base-gray">
              До: <span className="text-white">{getExpirationDate()}</span>
            </p>
            {data.assignedUser && (
              <p className="text-sm text-base-gray">
                МОП:{" "}
                <span className="text-white">
                  {getMopDisplayName(data.assignedUser)}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </Box>
  );
};
