import { Button } from "@/components/ui/button";
import { adminsQueryOptions } from "@/entities";
import {
	Box,
	ClientIcon,
	CreateAdminIcon,
	CreateCaseIcon,
	CreateCourseIcon,
	HeadText,
	LinkIcon,
	PracticeIcon,
} from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const AdminHomePage = () => {
	const { data, isLoading, error } = useQuery(adminsQueryOptions.profile());
	const navigate = useNavigate();

	const profileData = data?.data ?? {
		activeClientsTotal: 0,
		scheduledPracticesTotal: 0,
	};

	if (isLoading) {
		return (
			<div className="w-dvw h-dvh bg-white flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error) {
		console.error("Ошибка загрузки профиля:", error);
	}

	return (
		<>
			<div className="min-h-full pb-24">
				<div className="bg-base-bg flex text-white flex-col w-full rounded-b-3xl p-2">
					<HeadText
						className="gap-0.5 mb-8 pl-2 pt-2"
						head="Панель администратора"
						label="Ваши инструменты для организации и управления"
					/>

					<div className="flex items-center gap-2 mb-2">
						<Box className="px-2 pt-5 pb-3">
							<div className="w-full flex items-center gap-4">
								<PracticeIcon size={48} fill="#99A1A8" />
								<div className="flex flex-col items-start gap-0.5">
									<p className="text-base-gray leading-[100%]">Практик</p>
									<p className="text-[32px] text-white font-medium leading-[100%]">
										{profileData.scheduledPracticesTotal}
									</p>
								</div>
							</div>

							<Button
								variant="link"
								className="justify-between"
								text="main"
								size="link"
								onClick={() => navigate("/practice")}
							>
								Открыть список <LinkIcon />
							</Button>
						</Box>

						<Box className="px-2 pt-5 pb-3">
							<div className="w-full flex items-center gap-4">
								<ClientIcon size={48} fill="#99A1A8" />
								<div className="flex flex-col items-start gap-0.5">
									<p className="text-base-gray leading-[100%]">Клиентов</p>
									<p className="text-[32px] text-white font-medium leading-[100%]">
										{profileData.activeClientsTotal}
									</p>
								</div>
							</div>

							<Button
								variant="link"
								className="justify-between"
								text="main"
								size="link"
								onClick={() => navigate("/admin/clients")}
							>
								Открыть список <LinkIcon />
							</Button>
						</Box>
					</div>

					<div className="w-full gap-2 flex">
						<Button
							className="flex-1"
							variant="main-opacity"
							text="main"
							size="2s"
							onClick={() => navigate("/practice/create")}
						>
							Создать практику
						</Button>
						<Button
							className="flex-1"
							variant="main-opacity"
							text="main"
							size="2s"
							onClick={() => navigate("/admin/clients/create")}
						>
							Добавить клиента
						</Button>
					</div>
				</div>

				<div className="px-2">
					<HeadText
						className="gap-0.5 mb-8 pl-2 pt-2"
						head="Дополнительные действия"
						label="Управление системой и контентом"
						variant="black-gray"
						headSize="lg"
					/>

					<div className="grid grid-cols-2 grid-rows-2 gap-2">
						<Link to="/admin/course/create">
						<Box variant={"dark"} rounded="3xl">
							<CreateCourseIcon size={36} fill="#06935F" />
							<p className="font-medium text-white leading-[100%]">
								Создать курс
							</p>
						</Box>
						</Link>

						<Link to="/admin/cases/create">
							<Box variant={"dark"} rounded="3xl">
								<CreateCaseIcon size={36} fill="#06935F" />
								<p className="font-medium text-white leading-[100%]">
									Добавить кейс
								</p>
							</Box>
						</Link>

						<Link to="/admin/list" className="col-span-2">
							<Box
								variant={"dark"}
								rounded="3xl"
								direction="row"
								className="h-[90px] col-span-2"
							>
								<CreateAdminIcon size={36} fill="#06935F" />
								<p className="font-medium text-white leading-[100%]">
									Добавить администратора
								</p>
							</Box>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};
