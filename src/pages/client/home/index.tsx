import { Button } from "@/components/ui/button";
import { clientsQueryOptions } from "@/entities";
import { AddMopDrawer } from "@/feature";
import {
	BadgeIcon,
	Box,
	CoursesListIcon,
	HeadText,
	ListIcon,
	PracticeListIcon,
	TimerIcon,
} from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ClientHomePage = () => {
	const navigate = useNavigate();
	const [openDrawer, setOpenDrawer] = useState<boolean>(false);

	const { data, isLoading } = useQuery({
		...clientsQueryOptions.profile(),
		retry: 1,
	});

	const getProfileData = () => {
		if (isLoading) {
			return {
				totalLicenses: 0,
				activeLicenses: 0,
				notActiveLicenses: 0,
				closestExpirationDate: new Date().toISOString(),
				isLoading: true,
			};
		}

		return {
			...data?.data,
			isLoading: false,
		};
	};

	const profileData = getProfileData();
	const availableLicenses = profileData.notActiveLicenses ?? 0;

	const hasExpirationDate =
		profileData.closestExpirationDate && !profileData.isLoading;
	const expirationDate = hasExpirationDate
		? format(new Date(profileData.closestExpirationDate!), "dd.MM.yyyy", {
				locale: ru,
		  })
		: null;

	return (
		<>
			<div className="bg-base-bg flex text-white flex-col w-full rounded-b-3xl p-2">
				<HeadText
					className="gap-0.5 mb-8 pl-2 pt-2"
					head="Личный кабинет"
					label={
						profileData.isLoading
							? "Загрузка данных..."
							: "Управление вашими лицензиями и МОП"
					}
				/>

				<div className="flex items-center gap-2 mb-2">
					<Box>
						<div className="w-full flex items-center gap-4">
							<BadgeIcon size={32} />
							<p className="w-full text-xl font-medium leading-[100%]">
								{profileData.isLoading ? (
									<span className="h-6 w-16 bg-white/20 rounded animate-pulse block" />
								) : (
									<>
										{availableLicenses}{" "}
										<span className="font-normal text-base text-base-gray">
											из
										</span>{" "}
										{profileData.totalLicenses}
									</>
								)}
							</p>
						</div>
						<p className="text-base-gray">Доступно лицензий</p>
					</Box>

					{hasExpirationDate && (
						<Box>
							<div className="w-full flex items-center gap-4">
								<TimerIcon size={32} />
								<p className="text-xl font-medium leading-[100%]">
									{expirationDate}
								</p>
							</div>
							<p className="w-max text-base-gray">Окончание лицензии</p>
						</Box>
					)}
				</div>

				<Button
					variant="main-opacity"
					text="main"
					size="2s"
					onClick={() => setOpenDrawer(true)}
					disabled={profileData.isLoading || availableLicenses <= 0}
				>
					{profileData.isLoading
						? "Загрузка..."
						: availableLicenses <= 0
						? "Все лицензии использованы"
						: `Добавить МОП `}
				</Button>
			</div>

			<div className="px-2">
				<HeadText
					className="gap-0.5 mb-4 pl-2 pt-2"
					head="Дополнительные действия"
					label="Управление практиками и курсами"
					variant="black-gray"
					headSize="lg"
				/>

				<div className="grid grid-cols-2 grid-rows-2 gap-2">
					<Box
						variant={"dark"}
						rounded="3xl"
						onClick={() => navigate("/practice")}
						className="cursor-pointer hover:opacity-80 transition-opacity"
					>
						<PracticeListIcon size={36} fill="#06935F" />
						<p className="font-medium text-white leading-[100%]">
							Список практик
						</p>
					</Box>

					<Box
						variant={"dark"}
						rounded="3xl"
						onClick={() => navigate("/client/list-mop")}
						className="cursor-pointer hover:opacity-80 transition-opacity"
					>
						<ListIcon size={36} fill="#06935F" />
						<p className="font-medium text-white leading-[100%]">Список МОП</p>
					</Box>

					<Box
						variant={"dark"}
						rounded="3xl"
						direction="row"
						className="h-[90px] col-span-2"
					>
						<CoursesListIcon size={36} fill="#06935F" />
						<p className="font-medium text-white leading-[100%]">
							Список курсов
						</p>
					</Box>
				</div>
			</div>

			<AddMopDrawer open={openDrawer} onOpenChange={setOpenDrawer} />
		</>
	);
};
