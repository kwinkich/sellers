import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/shared";
import WebApp from "@twa-dev/sdk";
import bgPng from "/images/bg.png";
import logoPng from "/images/image.png";

export const BlockedPage = () => {
	return (
		<div
			className="min-h-screen flex flex-col justify-center items-center relative w-dvw bg-cover bg-center bg-no-repeat px-2"
			style={{ backgroundImage: `url(${bgPng})` }}
		>
			<img src={logoPng} className="fixed top-[106px]  w-[350px] h-[142px]" />

			<div className="bg-second-bg px-2 pt-6 pb-4 fixed bottom-16 rounded-[20px] flex flex-col items-center gap-4 w-[95dvw] mx-2 ">
				<p className="text-3xl font-semibold text-center text-white">
					У вас отсуствует <br /> активная лицензия
				</p>
				<p className=" text-base-gray mb-2 w-[352px] text-center">
					Обратитесь к менеджеру для получения доступа к приложению
				</p>
				<Button
					size="sm"
					className="w-[358px] justify-between"
					onClick={() => WebApp.openTelegramLink("https://t.me/Vladimir_Dubko")}
				>
					Связаться с менеджером
					<ArrowIcon size={28} />
				</Button>
			</div>
		</div>
	);
};
