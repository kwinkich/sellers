import {
	AdminHomePage,
	ClientHomePage,
	ClientListMopPage,
  MopProfilePage,

} from "@/pages";
import ApiDashboard from "@/pages/temp";
import { createBrowserRouter } from "react-router-dom";
import { ClientLayout } from "../layouts/ClientLayout/client.layout";

export const route = createBrowserRouter([
	{
		path: "/",
		element: <ApiDashboard />,
	},
	{
		path: "/client",
		element: <ClientLayout />,
		children: [
			{
				path: "home",
				element: <ClientHomePage />,
			},
			{
				path: "list-mop",
				element: <ClientListMopPage />,
			},
			// {
			// 	path: "mop/:id",
			// 	element: <MopProfilePage />,
			// },
		],
	},
  {
    path: "/mop",
    element: <MopProfilePage />,
    children: [
      {
        path: "profile",
        element: <MopProfilePage />,
      },
    ],
  },

	{
		path: "/admin/home",
		element: <AdminHomePage />,
	},
]);
