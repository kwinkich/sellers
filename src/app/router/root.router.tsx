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
	CreateCoursePage,
	CreateLessonPage,
	CreateModulePage,
	CreateQuizPage,
	EditQuizPage,
	EvaluationPage,
	EvaluationReportPage,
	LessonDetailsPage,
	LessonEditPage,
	MopCoursesPage,
	MopDetailsPage,
	MopLessonsPage,
	MopProfilePage,
	QuizPage,
} from "@/pages";
import { CourseEditPage } from "@/pages/admin/course-edit";
import { ModuleEditPage } from "@/pages/admin/module-edit";
import { MopCourseDetailPage } from "@/pages/mop/mop-profile/course-detail";
import PracticeCreatePage from "@/pages/practice/create";
import PracticeHomePage from "@/pages/practice/home";
import PracticePreviewPage from "@/pages/practice/preview";
import { createBrowserRouter } from "react-router-dom";
import { AppInitLayout, MopLayout, PracticeLayout } from "../layouts";
import { AdminLayout } from "../layouts/AdminLayout/admin.layout";
import { ClientLayout } from "../layouts/ClientLayout/client.layout";

export const route = createBrowserRouter([
	{
		path: "/",
		element: <AppInitLayout />,
		children: [
			{
				path: "client",
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
				path: "mop",
				element: <MopLayout />,
				children: [
					{
						path: "home",
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
				path: "admin",
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
					{
						path: "course/create",
						element: <CreateCoursePage />,
					},
					{
						path: "course/:id/edit",
						element: <CourseEditPage />,
					},
					{
						path: "course/:id/module/create",
						element: <CreateModulePage />,
					},
					{
						path: "module/:id/edit",
						element: <ModuleEditPage />,
					},
					{
						path: "module/:id/lesson/create",
						element: <CreateLessonPage />,
					},
					{
						path: "lesson/:id/edit",
						element: <LessonEditPage />,
					},
					{
						path: "lesson/:id/quiz/create",
						element: <CreateQuizPage />,
					},
					{
						path: "quiz/:id/edit",
						element: <EditQuizPage />,
					},
				],
			},
      {
        path: "practice",
        element: <PracticeLayout />,
        children: [
          {
            index: true,
            element: <PracticeHomePage />
          },
          {
            path: "create",
            element: <PracticeCreatePage />
          },
          {
            path: "preview",
            element: <PracticePreviewPage />
          },
        ],
      },
      {
        path: "evaluation",
        children: [
          {
            path: "evaluate/:practiceId",
            element: <EvaluationPage />,
          },
        ],
      },
      {
        path: "report/:practiceId",
        element: <EvaluationReportPage />,
      }
		],
	},
]);
