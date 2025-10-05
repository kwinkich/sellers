import { Separator } from "@/components/ui/separator";
import type { LicenseInfo } from "@/entities";
import { Badge, Box } from "@/shared";
import { format } from "date-fns";
import type { FC } from "react";

export const LicenseCard: FC<{ data: LicenseInfo }> = ({ data }) => {
	const getBadgeVariant = (status: LicenseInfo["status"]) => {
		switch (status) {
			case "ACTIVE":
				return "main";
			case "NOT_ACTIVE":
				return "gray";
			case "EXPIRED":
				return "red";
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
		expirationDate.setDate(today.getDate() + data.daysLeft);
		return format(expirationDate, "dd.MM.yyyy");
	};

	const getExpiredDate = () => {
		const today = new Date();
		const expiredDate = new Date(today);
		expiredDate.setDate(today.getDate() - Math.abs(data.daysLeft));
		return format(expiredDate, "dd.MM.yyyy");
	};

	return (
		<Box variant="dark" className="gap-3 p-4" justify="start" align="start">
			<div className="flex items-center justify-between w-full">
				<p className="text-lg font-medium text-white">Лицензия #{data.id}</p>
				<Badge
					label={getStatusText(data.status)}
					variant={getBadgeVariant(data.status) as any}
				/>
			</div>

			<Separator className="bg-[#FFFFFF1A]" />

			<div className="space-y-2">
				{data.status === "EXPIRED" ? (
					<>
						<p className="text-sm text-base-gray">
							Истекла: <span className="text-white">{getExpiredDate()}</span>
						</p>
					</>
				) : data.status === "ACTIVE" ? (
					<>
						<p className="text-sm text-base-gray">
							До: <span className="text-white">{getExpirationDate()}</span>
						</p>
					</>
				) : (
					<p className="text-sm text-base-gray">
						До: <span className="text-white">{getExpirationDate()}</span>
					</p>
				)}
			</div>
		</Box>
	);
};
