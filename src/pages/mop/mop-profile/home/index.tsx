import type { MopPractice, MopSkill } from "@/entities";
import { mopProfilesQueryOptions } from "@/entities";
import { ArrowIcon, Box, HeadText } from "@/shared";
import { MopNavBar } from "@/widget";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export const MopProfilePage = () => {
	const {
		data: profileRes,
		isLoading,
		error,
	} = useQuery(mopProfilesQueryOptions.profileInfo());
	const profile = profileRes?.data;

	const displayName = profile?.displayName ?? "-";
	const companyName = profile?.companyName ?? "-";
	const repScore = profile?.repScore ?? 0;
	const licenseId = profile?.currentSlotId ?? "-";
	const licenseExpiresAt = profile?.currentSlotExpiresAt
		? new Date(profile.currentSlotExpiresAt).toLocaleDateString("ru-RU")
		: "-";
	const learningProgress = profile?.learningProgress ?? 0;
	const normalizedProgress = Math.max(0, Math.min(100, learningProgress));

	const { data: skillsRes } = useQuery(mopProfilesQueryOptions.profileSkills());
	const skills = skillsRes?.data ?? [];

	const { data: practicesRes } = useQuery(
		mopProfilesQueryOptions.profilePractices()
	);
	const practices = practicesRes?.data ?? [];

	const getSkillClasses = (status: MopSkill["status"]) => {
		switch (status) {
			case "FULL":
				return "bg-base-opacity10-main text-base-main";
			case "HALF":
				return "bg-[#FFC1071A] text-[#FFC107]";
			default:
				return "bg-[#FFFFFF14] text-[#E3E3E3]";
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6 px-2 pt-4">
				<HeadText
					head="Профиль МОП"
					label="Загрузка данных..."
					variant="black-gray"
				/>
				<div className="flex justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (error || !profileRes) {
		return (
			<div className="flex flex-col gap-6 px-2 pt-4">
				<HeadText
					head="Профиль МОП"
					label="Ошибка загрузки профиля"
					variant="black-gray"
				/>
				<div className="text-center py-8 text-destructive">
					{(error as any)?.message || "Профиль не найден"}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-second-bg min-h-dvh">
			<div className="flex flex-col gap-3 bg-base-bg rounded-b-3xl px-2 pb-3">
				<div className="flex items-center justify-between mb-2">
					<HeadText
						className="gap-0.5 pl-2 pt-2"
						head={displayName}
						label={companyName}
					/>

					<div className="rounded-full px-5 py-2.5 bg-base-opacity10-main">
						<p className="text-xs font-medium text-base-main">Rep {repScore}</p>
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
						<p className="text-xs font-medium text-white">{licenseId}</p>
					</div>

					<div className="flex items-center gap-1.5">
						<p className="text-xs text-base-gray">До</p>
						<p className="text-xs font-medium text-white">{licenseExpiresAt}</p>
					</div>
				</Box>

				<Box className="px-3 py-2">
					<div className=" w-full flex items-center gap-3">
						<div className="bg-[#FFFFFF0D] p-2 rounded-[8px]">
							<p className="font-medium text-white">{learningProgress}%</p>
						</div>

						<p className="flex-1 text-xs text-base-gray">Прогресс обучения</p>

						<ArrowIcon size={24} fill="#06935F" />
					</div>

					<div className="w-full flex items-center gap-2">
						{Array(5)
							.fill(null)
							.map((_, idx) => {
								const segmentStart = idx * 20;
								const filledInSegment = Math.min(
									20,
									Math.max(0, normalizedProgress - segmentStart)
								);
								const widthPercent = (filledInSegment / 20) * 100;

								return (
									<div
										key={idx}
										className="h-2 rounded-full w-full bg-[#FFFFFF0A] overflow-hidden"
									>
										<div
											className="h-full bg-base-main"
											style={{ width: `${widthPercent}%` }}
										/>
									</div>
								);
							})}
					</div>
				</Box>
			</div>

			<HeadText
				className="gap-0.5 pl-2 pt-2"
				head="Навыки и компетенции"
				label="Следите за прогрессом и улучшайте результат"
			/>

			<div className="px-2 pt-2 flex flex-wrap gap-2">
				{skills.length === 0 ? (
					<p className="text-xs text-base-gray pl-2">Навыков пока нет</p>
				) : (
					skills.map((s) => (
						<span
							key={s.id}
							className={`text-xs font-medium px-3 py-1 rounded-full ${getSkillClasses(
								s.status
							)}`}
						>
							{s.name}
						</span>
					))
				)}
			</div>

			<HeadText
				className="gap-0.5 pl-2 pt-3"
				head="Практики"
				label="Ваши запланированные и прошедшие практики"
			/>

			<div className="px-2 flex flex-col gap-2">
				{practices.length === 0 ? (
					<p className="text-xs text-base-gray pl-2">Практик пока нет</p>
				) : (
					practices.map((p: MopPractice) => (
						<Box key={p.id} className="px-3 py-2" rounded="xl">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium text-white">{p.title}</p>
								<span className="text-[10px] text-base-gray uppercase">
									{p.practiceType}
								</span>
							</div>
							<div className="flex items-center justify-between mt-1.5">
								<p className="text-xs text-base-gray">
									{new Date(p.startAt).toLocaleString("ru-RU")} —{" "}
									{new Date(p.endAt).toLocaleString("ru-RU")}
								</p>
								<div className="flex items-center gap-2">
									<span className="text-[10px] text-base-gray">{p.myRole}</span>
									<span className="text-[10px] text-base-main">{p.status}</span>
								</div>
							</div>
						</Box>
					))
				)}
			</div>

			<MopNavBar />
		</div>
	);
};
