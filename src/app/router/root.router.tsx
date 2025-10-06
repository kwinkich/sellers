import {
	AdminAddClientPage,
	AdminClientsListPage,
	AdminCreateCasePage,
	AdminHomePage,
	AdminLicensesListPage,
	AdminScenariosCreatePage,
	AdminsControlPage,
	AdminUpdateClientPage,
	ClientHomePage,
	ClientListMopPage,
	LessonDetailsPage,
	MopCoursesPage,
	MopDetailsPage,
	MopLessonsPage,
	MopProfilePage,
	QuizPage,
} from "@/pages";
import { MopCourseDetailPage } from "@/pages/mop/mop-profile/course-detail";
import PracticeHomePage from "@/pages/practice/home";
import ApiDashboard from "@/pages/temp";
import { createBrowserRouter } from "react-router-dom";
import { MopLayout } from "../layouts";
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
			{
				path: "mop/:id",
				element: <MopDetailsPage />,
			},
		],
	},
	{
		path: "/mop",
		element: <MopLayout />,
		children: [
			{
				path: "profile",
				element: <MopProfilePage />,
			},
			{
				path: "education",
				children: [
					{
						path: "courses",
						element: <MopCoursesPage />,
					},
					{
						path: "courses/:courseId",
						element: <MopCourseDetailPage />,
					},
					{
						path: "courses/:courseId/lessons",
						element: <MopLessonsPage />,
					},
					{
						path: "lesson/:lessonId",
						element: <LessonDetailsPage />,
					},
					{
						path: "quizzes/:id",
						element: <QuizPage />,
					},
				],
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
			{
				path: "scenarios/create",
				element: <AdminScenariosCreatePage />,
			},
		],
	},
	{
		path: "practice",
		element: <PracticeHomePage />,
	},
]);
