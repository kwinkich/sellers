import { Button } from "@/components/ui/button";
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
import { AdminNavBar } from "@/widget";

export const AdminHomePage = () => {
	return (
		<>
			<div className="w-dvw h-dvh bg-white">
				<div className="bg-base-bg flex  text-white flex-col  w-full rounded-b-3xl p-2">
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
									<p className="text-base-gray leading-[100%]">Боев</p>
									<p className="text-[32px] text-white font-medium leading-[100%]">
										123
									</p>
								</div>
							</div>

							<Button
								variant="link"
								className="justify-between"
								text="main"
								size="link"
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
										2231
									</p>
								</div>
							</div>

							<Button
								variant="link"
								className="justify-between"
								text="main"
								size="link"
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
						>
							Создать практику
						</Button>
						<Button
							className="flex-1"
							variant="main-opacity"
							text="main"
							size="2s"
						>
							Добавить клиента
						</Button>
					</div>
				</div>

				<div className="px-2 ">
					<HeadText
						className="gap-0.5 mb-8 pl-2 pt-2"
						head="Дополнительные действия"
						label="Подзаголовок"
						variant="black-gray"
						headSize="lg"
					/>

					<div className="grid grid-cols-2 grid-rows-2 gap-2">
						<Box variant={"dark"} rounded="3xl">
							<CreateCourseIcon size={36} fill="#06935F" />
							<p className="font-medium text-white leading-[100%]">
								Создать курс
							</p>
						</Box>

						<Box variant={"dark"} rounded="3xl">
							<CreateCaseIcon size={36} fill="#06935F" />
							<p className="font-medium text-white leading-[100%]">
								Добавить кейс
							</p>
						</Box>

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
					</div>
				</div>

				<AdminNavBar />
			</div>
		</>
	);
};
