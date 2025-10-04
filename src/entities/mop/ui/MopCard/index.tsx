import { Box, CloseIcon } from "@/shared";

export const MopCard = () => {
	return (
		<div className="p-3 bg-base-bg rounded-2xl flex flex-col gap-3 ">
			<div className="flex items-center justify-between">
				<p className="font-medium text-lg text-white">Всилий Борисов</p>
				<CloseIcon fill="#E3E3E3" />
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
						<p className="text-xs font-medium text-white">432123132</p>
					</div>

					<div className="flex items-center gap-1.5">
						<p className="text-xs text-base-gray">До</p>
						<p className="text-xs font-medium text-white">12.12.2025</p>
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
				<p className="text-xs text-base-gray">Был в сети 10 часов назад</p>
			</div>
		</div>
	);
};
