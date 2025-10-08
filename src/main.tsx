import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import WebApp from '@twa-dev/sdk';
import { Provider } from "./app/provider/provider";
import { route } from "./app/router/root.router";
import "./index.css";

// Инициализация Telegram WebApp
WebApp.ready();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider>
			<RouterProvider router={route} />
		</Provider>
	</StrictMode>
);
