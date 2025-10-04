import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "./app/provider/provider";
import { route } from "./app/router/root.router";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider>
			<RouterProvider router={route} />
		</Provider>
	</StrictMode>
);
