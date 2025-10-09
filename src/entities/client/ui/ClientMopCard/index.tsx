import { Box, CloseIcon } from "@/shared";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { ClientMop } from "../../model";

interface ClientMopCardProps {
	data: ClientMop;
	onDelete?: (mop: ClientMop) => void;
	isDeleting?: boolean;
}

export const ClientMopCard = ({ data, onDelete, isDeleting }: ClientMopCardProps) => {
	// Форматируем дату окончания лицензии
	const formatExpirationDate = () => {
		if (!data.licenseExpiresAt) return "12.12.2025";

		try {
			const expirationDate = new Date(data.licenseExpiresAt);
			return format(expirationDate, "dd.MM.yyyy", { locale: ru });
		} catch {
			return "12.12.2025";
		}
	};

	return (
		<div className="p-3 bg-base-bg rounded-2xl flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<p className="font-medium text-lg text-white">
					{data.displayName}
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
							#{data.licenseSlotId}
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
							<p className="font-medium text-white">{data.learningProgress}%</p>
						</div>
					</Box>

					<Box className="p-2" rounded="2s">
						<p className="text-xs text-base-gray">Прогресс навыков</p>
						<div className="w-full py-2 flex items-center justify-center bg-base-main rounded-[8px]">
							<p className="font-medium text-white">{data.skillsProgress}%</p>
						</div>
					</Box>
				</div>
			</div>
		</div>
	);
};
