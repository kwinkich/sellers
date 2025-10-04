import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
	AddPeopleIcon,
	BadgeIcon,
	Box,
	CoursesListIcon,
	HeadText,
	ListIcon,
	PracticeListIcon,
	TimerIcon,
} from "@/shared";
import { useState } from "react";

export const ClientHomePage = () => {
	const [openDrawer, setOpenDrawer] = useState<boolean>(false);

	return (
		<>
			<div className="bg-base-bg flex  text-white flex-col  w-full rounded-b-3xl p-2">
				<HeadText
					className="gap-0.5 mb-8 pl-2 pt-2"
					head="Личный кабинет"
					label="Подзаголовок"
				/>

				<div className="flex items-center gap-2 mb-2">
					<Box>
						<div className="w-full flex items-center gap-4">
							<BadgeIcon size={32} />

							<p className="w-full text-xl font-medium leading-[100%]">
								21{" "}
								<span className="font-normal text-base text-base-gray">из</span>{" "}
								30
							</p>
						</div>

						<p className="text-base-gray">Доступно лицензий</p>
					</Box>

					<Box>
						<div className="w-full flex items-center gap-4">
							<TimerIcon size={32} />

							<p className="text-xl font-medium leading-[100%]">12.12.2024</p>
						</div>

						<p className="w-max text-base-gray">Окончание лицензии</p>
					</Box>
				</div>

				<Button
					variant="main-opacity"
					text="main"
					size="2s"
					onClick={() => setOpenDrawer(true)}
				>
					Добавить МОП
				</Button>
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
						<PracticeListIcon size={36} fill="#06935F" />
						<p className="font-medium text-white leading-[100%]">
							Список практик
						</p>
					</Box>

					<Box variant={"dark"} rounded="3xl">
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

			<Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
				<DrawerContent className="bg-second-bg ">
					<DrawerHeader className="items-center">
						<AddPeopleIcon size={70} fill="#06935F" />
						<p className="text-2xl font-medium text-white">Добавление МОП</p>
						<p className="text-xs text-base-gray ">
							Укажите данные для подключения участника
						</p>
					</DrawerHeader>

					<div className="flex flex-col gap-3 p-4">
						<Input placeholder="Введите имя МОП" variant="dark" />
						<Input placeholder="Введите @username для МОП" variant="dark" />
					</div>

					<DrawerFooter>
						<Button onClick={() => setOpenDrawer(false)}>Добавить</Button>
						<Button onClick={() => setOpenDrawer(false)} variant="link">
							Отменить
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
};
