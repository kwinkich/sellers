import { ArrowIcon, Box, HeadText } from "@/shared";

export const ClientMopProfilePage = () => {
	return (
		<div className="bg-second-bg pb-28">
			<div className="flex flex-col gap-3 bg-base-bg rounded-b-3xl px-2 pb-3">
				<div className="flex items-center justify-between mb-2">
					<HeadText
						className="gap-0.5 pl-2 pt-2"
						head="Василий Борисов"
						label="ООО Лига Продаж"
					/>

					<div className="rounded-full px-5 py-2.5 bg-base-opacity10-main">
						<p className="text-xs font-medium text-base-main">Rep 6</p>
					</div>
				</div>

				<Box
					direction="row"
					justify="between"
					className="px-4 py-3"
					rounded="xl"
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

				<Box className="px-3 py-2">
					<div className=" w-full flex items-center gap-3">
						<div className="bg-[#FFFFFF0D] p-2 rounded-[8px]">
							<p className="font-medium text-white">57%</p>
						</div>

						<p className="flex-1 text-xs text-base-gray">Прогресс обучения</p>

						<ArrowIcon size={24} fill="#06935F" />
					</div>

					<div className="w-full flex items-center gap-2">
						{Array(5)
							.fill(null)
							.map((_, idx) => (
								<div
									key={idx}
									className={`h-2 rounded-full w-full ${
										idx < 2
											? "bg-base-main"
											: idx === 2
											? "bg-[#FFFFFF0A]"
											: "bg-[#FFFFFF0A]"
									}  `}
								/>
							))}
					</div>
				</Box>
			</div>

			<HeadText
				className="gap-0.5 pl-2 pt-2"
				head="Навыки и компетенции"
				label="Следите за прогрессом и улучшайте результат"
			/>
		</div>
	);
};
