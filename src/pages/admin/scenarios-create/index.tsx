import { CreateScenarioForm } from "@/feature";
import { HeadText } from "@/shared";

export const AdminScenariosCreatePage = () => {
	return (
		<div className="w-dvw h-dvh bg-white flex flex-col">
			<div className="bg-base-bg text-white rounded-b-3xl px-2 pt-4 pb-4 mb-2 flex flex-col gap-4">
				<HeadText head="Создание сценария" label="Добавьте новый сценарий" />
				<CreateScenarioForm />
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col gap-6 px-2 pt-4 pb-32 min-h-full" />
			</div>
		</div>
	);
};


