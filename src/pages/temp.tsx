import {
	AdminsAPI,
	ClientsAPI,
	CoursesAPI,
	MopProfilesAPI,
	PracticesAPI,
	type CreateClientRequest,
} from "@/entities";
import WebApp from "@twa-dev/sdk";
import React, { useState } from "react";

interface ApiDashboardProps {
	// Пропсы при необходимости
}

export const ApiDashboard: React.FC<ApiDashboardProps> = () => {
	// const auth = useMutation({
	// 	mutationFn: AuthAPI.authTelegram,
	// 	onSuccess: (data) =>
	// 		console.info(`[AUTH]: Auth succes - ${data.data.accessToken}`),
	// 	onError: () => console.error("[AUTH]: Auth error"),
	// });

	// useEffect(() => {
	// 	auth.mutate();
	// }, []);

	console.log("Initdata:", WebApp.initData);

	const [activeTab, setActiveTab] = useState("admins");
	const [response, setResponse] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Состояния для разных форм
	const [adminData, setAdminData] = useState({ telegramUsername: "" });
	const [clientData, setClientData] = useState<CreateClientRequest>({
		level: "LEVEL_3",
		telegramUsername: "",
		companyName: "",
		inn: "",
		licenseCount: 1,
		licenseExpiresAt: new Date().toISOString(),
	});

	const clearState = () => {
		setResponse(null);
		setError(null);
	};

	const handleApiCall = async (apiCall: Promise<any>) => {
		setLoading(true);
		clearState();

		try {
			const result = await apiCall;
			setResponse(result);
		} catch (err: any) {
			setError(err.message || "Произошла ошибка");
		} finally {
			setLoading(false);
		}
	};

	// Рендер вкладки Администраторы
	const renderAdminsTab = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Администраторы</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Создание администратора */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Создать администратора</h4>
					<div className="space-y-2">
						<input
							type="text"
							placeholder="Telegram username"
							value={adminData.telegramUsername}
							onChange={(e) =>
								setAdminData({ telegramUsername: e.target.value })
							}
							className="w-full p-2 border rounded"
						/>
						<button
							onClick={() => handleApiCall(AdminsAPI.createAdmin(adminData))}
							disabled={loading}
							className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
						>
							Создать
						</button>
					</div>
				</div>

				{/* Получение списка администраторов */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Список администраторов</h4>
					<button
						onClick={() => handleApiCall(AdminsAPI.getAdmins())}
						disabled={loading}
						className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить список
					</button>
				</div>

				{/* Получение профиля */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Профиль администратора</h4>
					<button
						onClick={() => handleApiCall(AdminsAPI.getAdminProfile())}
						disabled={loading}
						className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить профиль
					</button>
				</div>

				{/* Удаление администратора */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Удалить администратора</h4>
					<div className="space-y-2">
						<input
							type="number"
							placeholder="ID администратора"
							className="w-full p-2 border rounded"
							id="delete-admin-id"
						/>
						<button
							onClick={() => {
								const id = parseInt(
									(
										document.getElementById(
											"delete-admin-id"
										) as HTMLInputElement
									).value
								);
								handleApiCall(AdminsAPI.deleteAdmin(id));
							}}
							disabled={loading}
							className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
						>
							Удалить
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	// Рендер вкладки Клиенты
	const renderClientsTab = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Клиенты</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Создание клиента */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Создать клиента</h4>
					<div className="space-y-2">
						<input
							type="text"
							placeholder="Telegram username"
							value={clientData.telegramUsername}
							onChange={(e) =>
								setClientData({
									...clientData,
									telegramUsername: e.target.value,
								})
							}
							className="w-full p-2 border rounded"
						/>
						<input
							type="text"
							placeholder="Company name"
							value={clientData.companyName}
							onChange={(e) =>
								setClientData({ ...clientData, companyName: e.target.value })
							}
							className="w-full p-2 border rounded"
						/>
						<input
							type="text"
							placeholder="INN"
							value={clientData.inn}
							onChange={(e) =>
								setClientData({ ...clientData, inn: e.target.value })
							}
							className="w-full p-2 border rounded"
						/>
						<button
							onClick={() => handleApiCall(ClientsAPI.createClient(clientData))}
							disabled={loading}
							className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
						>
							Создать клиента
						</button>
					</div>
				</div>

				{/* Получение активных клиентов */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Активные клиенты</h4>
					<button
						onClick={() => handleApiCall(ClientsAPI.getActiveClients())}
						disabled={loading}
						className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить активных
					</button>
				</div>

				{/* Получение истекших клиентов */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Истекшие клиенты</h4>
					<button
						onClick={() => handleApiCall(ClientsAPI.getExpiredClients())}
						disabled={loading}
						className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить истекших
					</button>
				</div>

				{/* Получение профиля клиента */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Профиль клиента</h4>
					<button
						onClick={() => handleApiCall(ClientsAPI.getClientProfile())}
						disabled={loading}
						className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить профиль
					</button>
				</div>
			</div>
		</div>
	);

	// Рендер вкладки МОП профили
	const renderMopProfilesTab = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">МОП Профили</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Получение профиля МОП */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Информация профиля</h4>
					<button
						onClick={() => handleApiCall(MopProfilesAPI.getMopProfileInfo())}
						disabled={loading}
						className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить информацию
					</button>
				</div>

				{/* Получение навыков МОП */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Навыки МОП</h4>
					<button
						onClick={() => handleApiCall(MopProfilesAPI.getMopProfileSkills())}
						disabled={loading}
						className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить навыки
					</button>
				</div>

				{/* Получение практик МОП */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Практики МОП</h4>
					<button
						onClick={() =>
							handleApiCall(MopProfilesAPI.getMopProfilePractices())
						}
						disabled={loading}
						className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить практики
					</button>
				</div>
			</div>
		</div>
	);

	// Рендер вкладки Курсы
	const renderCoursesTab = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Курсы</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Получение списка курсов */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Список курсов</h4>
					<button
						onClick={() => handleApiCall(CoursesAPI.getCourses())}
						disabled={loading}
						className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить курсы
					</button>
				</div>

				{/* Получение курса по ID */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Курс по ID</h4>
					<div className="space-y-2">
						<input
							type="number"
							placeholder="ID курса"
							className="w-full p-2 border rounded"
							id="course-id"
						/>
						<button
							onClick={() => {
								const id = parseInt(
									(document.getElementById("course-id") as HTMLInputElement)
										.value
								);
								handleApiCall(CoursesAPI.getCourseById(id));
							}}
							disabled={loading}
							className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
						>
							Получить курс
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	// Рендер вкладки Практики
	const renderPracticesTab = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Практики</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Получение списка практик */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Список практик</h4>
					<button
						onClick={() => handleApiCall(PracticesAPI.getPractices())}
						disabled={loading}
						className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить практики
					</button>
				</div>

				{/* Получение карточек практик */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Карточки практик</h4>
					<button
						onClick={() => handleApiCall(PracticesAPI.getPracticeCards())}
						disabled={loading}
						className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить карточки
					</button>
				</div>

				{/* Мои практики */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Мои практики</h4>
					<button
						onClick={() => handleApiCall(PracticesAPI.getMyPractices())}
						disabled={loading}
						className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить мои практики
					</button>
				</div>

				{/* Прошедшие практики */}
				<div className="border p-4 rounded">
					<h4 className="font-medium mb-2">Прошедшие практики</h4>
					<button
						onClick={() => handleApiCall(PracticesAPI.getPastPractices())}
						disabled={loading}
						className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						Получить прошедшие
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-6">API Тестовый Дашборд</h1>

			{/* Навигация по вкладкам */}
			<div className="flex flex-wrap gap-2 mb-6 border-b">
				{[
					"admins",
					"clients",
					"mop-profiles",
					"courses",
					"modules",
					"lessons",
					"quizzes",
					"skills",
					"cases",
					"scenarios",
					"practices",
					"evaluation",
				].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-4 py-2 rounded-t ${
							activeTab === tab
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700"
						}`}
					>
						{tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
					</button>
				))}
			</div>

			{/* Контент вкладок */}
			<div className="mb-6">
				{activeTab === "admins" && renderAdminsTab()}
				{activeTab === "clients" && renderClientsTab()}
				{activeTab === "mop-profiles" && renderMopProfilesTab()}
				{activeTab === "courses" && renderCoursesTab()}
				{activeTab === "practices" && renderPracticesTab()}
				{/* Добавьте остальные вкладки по аналогии */}
			</div>

			{/* Результаты запроса */}
			<div className="mt-8">
				<h3 className="text-lg font-semibold mb-2">Результат запроса:</h3>

				{loading && (
					<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
						Загрузка...
					</div>
				)}

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						Ошибка: {error}
					</div>
				)}

				{response && (
					<div className="bg-gray-100 border border-gray-300 rounded">
						<pre className="p-4 overflow-auto max-h-96">
							{JSON.stringify(response, null, 2)}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
};

export default ApiDashboard;
