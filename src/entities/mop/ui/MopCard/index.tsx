// entities/mop-card.tsx
import { Box, CloseIcon } from "@/shared";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { MopProfile } from "../../model";

interface MopCardProps {
	data: MopProfile;
	onDelete?: (mop: MopProfile) => void;
	isDeleting?: boolean;
}

export const MopCard = ({ data, onDelete, isDeleting }: MopCardProps) => {
	// Форматируем дату окончания лицензии
	const formatExpirationDate = () => {
		if (!data.currentSlot?.createdAt) return "12.12.2025";

		try {
			const createdAt = new Date(data.currentSlot.createdAt);
			const expirationDate = new Date(createdAt);
			expirationDate.setDate(createdAt.getDate() + 30);
			return format(expirationDate, "dd.MM.yyyy", { locale: ru });
		} catch {
			return "12.12.2025";
		}
	};

	// Время последней активности
	const formatLastSeen = () => {
		try {
			const updatedAt = new Date(data.updatedAt);
			const now = new Date();
			const diffHours = Math.floor(
				(now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
			);

			if (diffHours < 1) return "1 час назад";
			if (diffHours < 24) return `${diffHours} часов назад`;
			return "10 часов назад";
		} catch {
			return "10 часов назад";
		}
	};

	return (
		<div className="p-3 bg-base-bg rounded-2xl flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<p className="font-medium text-lg text-white">
					{data.mopUser?.displayName || "Всилий Борисов"}
				</p>
				{onDelete && (
					<button
						onClick={() => onDelete(data)}
						disabled={isDeleting}
						className="disabled:opacity-50"
					>
						<CloseIcon fill="#E3E3E3" />
					</button>
				)}
			</div>

			<div className="w-full flex flex-col gap-2">
				<Box
					direction="row"
					justify="between"
					className="px-4 py-3"
					rounded="2s"
				>
					<div className="flex items-center gap-1.5">
						<p className="text-xs text-base-gray">Лицензия</p>
						<p className="text-xs font-medium text-white">
							#{data.currentSlotId || "432123132"}
						</p>
					</div>

					<div className="flex items-center gap-1.5">
						<p className="text-xs text-base-gray">До</p>
						<p className="text-xs font-medium text-white">
							{formatExpirationDate()}
						</p>
					</div>
				</Box>

				<div className="w-full flex items-center gap-1">
					<Box className="p-2" rounded="2s">
						<p className="text-xs text-base-gray">Прогресс обучения</p>
						<div className="w-full py-2 flex items-center justify-center bg-base-main rounded-[8px]">
							<p className="font-medium text-white">57%</p>
						</div>
					</Box>

					<Box className="p-2" rounded="2s">
						<p className="text-xs text-base-gray">Прогресс обучения</p>
						<div className="w-full py-2 flex items-center justify-center bg-base-main rounded-[8px]">
							<p className="font-medium text-white">57%</p>
						</div>
					</Box>
				</div>
			</div>

			<div className="w-full flex justify-end">
				<p className="text-xs text-base-gray">Был в сети {formatLastSeen()}</p>
			</div>
		</div>
	);
};
