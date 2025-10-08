// components/AppInitLayout.tsx
import { Outlet } from "react-router-dom";
import { useAppInit } from "@/shared";
import { Loader2 } from "lucide-react";

export const AppInitLayout = () => {
	const { isLoading, isError, error } = useAppInit();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						Инициализация приложения
					</h2>
					<p className="text-sm text-gray-500">Проверка авторизации...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center max-w-md mx-4">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-2xl">⚠️</span>
					</div>
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						Ошибка инициализации
					</h2>
					<p className="text-sm text-gray-500 mb-4">
						{error?.message || "Не удалось загрузить приложение"}
					</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Попробовать снова
					</button>
				</div>
			</div>
		);
	}

	return <Outlet />;
};
