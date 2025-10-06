import {
    AdminAddClientPage,
    AdminClientsListPage,
    AdminHomePage,
    AdminLicensesListPage,
    AdminsControlPage,
    AdminUpdateClientPage,
    ClientHomePage,
    ClientListMopPage,
    MopProfilePage,
    AdminCreateCasePage
} from "@/pages";
import PracticeHomePage from "@/pages/practice/home";
import ApiDashboard from "@/pages/temp";
import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout/admin.layout";
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
		path: "/admin",
		element: <AdminLayout />,
		children: [
			{
				path: "home",
				element: <AdminHomePage />,
			},
			{
				path: "clients",
				element: <AdminClientsListPage />,
			},
			{
				path: "clients/create",
				element: <AdminAddClientPage />,
			},
			{
				path: "clients/update/:clientId",
				element: <AdminUpdateClientPage />,
			},
			{
				path: "clients/licenses/:clientId",
				element: <AdminLicensesListPage />,
			},
			{
				path: "list",
				element: <AdminsControlPage />,
			},
			{
				path: "cases/create",
				element: <AdminCreateCasePage />,
			},
		],
	},
  {
    path: "practice",
    element: <PracticeHomePage />,
  },
]);
