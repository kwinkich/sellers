import { CreateCaseForm } from "@/feature";
import { HeadText } from "@/shared";

export const AdminCreateCasePage = () => {
	return (
		<div className="w-dvw h-dvh bg-white flex flex-col">
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col gap-6 px-2 pt-4 pb-32 min-h-full">
					<HeadText
						head="Создание кейса"
						label="Добавьте новый кейс в систему"
						variant="black-gray"
					/>

					<CreateCaseForm />
				</div>
			</div>
		</div>
	);
};
