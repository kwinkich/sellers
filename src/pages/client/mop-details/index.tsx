import { UniversalAccordion } from "@/components/ui/u-accordion";
import type { MopPractice, MopSkill } from "@/entities";
import { mopProfilesQueryOptions } from "@/entities";
import { ArrowIcon, Box, HeadText, StudioIcon } from "@/shared";
import { ClientNavBar } from "@/widget";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

export const MopDetailsPage = () => {
	const { id } = useParams<{ id: string }>();

	const {
		data: profileRes,
		isLoading,
		error,
	} = useQuery(mopProfilesQueryOptions.profileInfoById(parseInt(id!)));

	const { data: skillsRes } = useQuery(
		mopProfilesQueryOptions.profileSkillsById(parseInt(id!))
	);

	const { data: practicesRes } = useQuery(
		mopProfilesQueryOptions.profilePracticesById(parseInt(id!))
	);

	const profile = profileRes?.data;
	const skills = skillsRes?.data ?? [];
	const practices = practicesRes?.data ?? [];

	if (isLoading) {
		return (
			<div className="bg-second-bg min-h-screen pb-28">
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
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="bg-second-bg min-h-screen pb-28">
				<div className="flex flex-col gap-6 px-2 pt-4">
					<HeadText
						head="Профиль МОП"
						label="Ошибка загрузки профиля"
						variant="black-gray"
					/>
					<div className="text-center py-8 text-base-gray">
						{error?.message || "МОП не найден"}
					</div>
				</div>
			</div>
		);
	}

	const displayName = profile?.displayName ?? "-";
	const companyName = profile?.companyName ?? "-";
	const repScore = profile?.repScore ?? 0;
	const licenseId = profile?.currentSlotId ?? "-";
	const licenseExpiresAt = profile?.currentSlotExpiresAt
		? new Date(profile.currentSlotExpiresAt).toLocaleDateString("ru-RU")
		: "-";
	const learningProgress = profile?.learningProgress ?? 0;
	const normalizedProgress = Math.max(0, Math.min(100, learningProgress));

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

	const getSkillName = (status: MopSkill["status"]) => {
		switch (status) {
			case "FULL":
				return "Да";
			case "HALF":
				return "50/50";
			default:
				return "Нет";
		}
	};

	const skillsAccordionItems = [
		{
			id: "skills",
			title: (
				<p className="text-lg font-medium leading-[100%] text-white">
					Список навыков
				</p>
			),
			content: (
				<div className="flex flex-col gap-2 pt-2">
					{skills.length === 0 ? (
						<p className="text-xs text-base-gray">Навыков пока нет</p>
					) : (
						skills.map((s) => (
							<div className="w-full flex items-center justify-between bg-second-bg p-2 rounded-[8px]">
								<p>{s.name}</p>
								<div
									className={` px-[18px] py-[4.5px] rounded-[8px] ${getSkillClasses(
										s.status
									)}`}
								>
									<p className="text-xs leading-[100%]">
										{getSkillName(s.status)}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			),
		},
	];

	const practicesAccordionItems = [
		{
			id: "practices",
			title: (
				<p className="text-lg font-medium leading-[100%] text-white">
					История практик
				</p>
			),
			content: (
				<div className="flex flex-col gap-2 pt-2">
					{practices.length === 0 ? (
						<p className="text-xs text-base-gray">Практик пока нет</p>
					) : (
						practices.map((p: MopPractice) => (
							<Box
								key={p.id}
								className="px-3 py-2"
								direction="row"
								rounded="xl"
							>
								<StudioIcon size={45} fill="#06935F" />
								<div className="flex flex-col flex-1 gap-1 ">
									<span className="text-xs w-max rounded-2xl bg-base-bg px-3 py-1 text-base-gray">
										{p.practiceType}
									</span>
									<p className="text-lg font-medium text-white">{p.title}</p>
								</div>
								<div className="flex flex-col items-center justify-between">
									<span className="text-[10px] text-base-gray">{p.role}</span>
									<span className="text-[10px] text-base-main">{p.status}</span>
								</div>
							</Box>
						))
					)}
				</div>
			),
		},
	];

	return (
		<div className="bg-second-bg min-h-full pb-28">
			{/* Шапка с информацией о МОП */}
			<div className="flex flex-col gap-3 bg-base-bg rounded-b-3xl px-2 pb-3 mb-4">
				<div className="flex items-center justify-between mb-2">
					<HeadText
						className="gap-0.5 pl-2 pt-2"
						head={displayName}
						label={`МОП компании ${companyName}`}
					/>

					<div className="rounded-full px-5 py-2.5 bg-base-opacity10-main">
						<p className="text-xs font-medium text-base-main">Rep {repScore}</p>
					</div>
				</div>

				{/* Информация о лицензии */}
				<Box
					direction="row"
					justify="between"
					className="px-4 py-3"
					rounded="xl"
				>
					<div className="flex items-center gap-1.5">
						<p className="text-xs text-base-gray">Лицензия</p>
						<p className="text-xs font-medium text-white">#{licenseId}</p>
					</div>

					<div className="flex items-center gap-1.5">
						<p className="text-xs text-base-gray">До</p>
						<p className="text-xs font-medium text-white">{licenseExpiresAt}</p>
					</div>
				</Box>

				{/* Прогресс обучения */}
				<Box className="px-3 py-2">
					<div className="w-full flex items-center gap-3">
						<div className="bg-[#FFFFFF0D] p-2 rounded-[8px]">
							<p className="font-medium text-white">{learningProgress}%</p>
						</div>

						<p className="flex-1 text-xs text-base-gray">
							Прогресс обучения МОП
						</p>

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

			<div className="flex flex-col gap-2 px-2">
				<HeadText
					className="mb-2 px-2"
					head="Навыки и компетенции"
					label="Навыки и компетенции МОП"
					headSize="lg"
					labelSize="xs"
				/>
				<UniversalAccordion
					items={skillsAccordionItems}
					type="single"
					itemClassName="border-none bg-transparent"
					triggerClassName="px-0 hover:no-underline"
					contentClassName="px-0"
				/>

				<UniversalAccordion
					items={practicesAccordionItems}
					type="single"
					itemClassName="border-none bg-transparent"
					triggerClassName="px-0 hover:no-underline"
					contentClassName="px-0"
				/>
			</div>

			<ClientNavBar />
		</div>
	);
};
