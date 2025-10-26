import {
  AdminAddClientPage,
  AdminCasesListPage,
  AdminClientsListPage,
  AdminCreateCasePage,
  AdminEditScenarioPage,
  AdminHomePage,
  AdminLicensesListPage,
  AdminScenariosCreatePage,
  AdminScenariosListPage,
  AdminUpdateCasePage,
  AdminViewCasePage,
  AdminViewScenarioPage,
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
  CourseDetailEditPage,
  ModuleDetailEditPage,
  MopCoursesPage,
  MopDetailsPage,
  MopLessonsPage,
  MopProfilePage,
  QuizPage,
} from "@/pages";
import { CourseEditPage } from "@/pages/admin/course-edit";
import { AdminCourseListPage } from "@/pages/admin/course-list";
import { ModuleEditPage } from "@/pages/admin/module-edit";
import { MopCourseDetailPage } from "@/pages/mop/mop-profile/course-detail";
import PracticeCreatePage from "@/pages/practice/create";
import PracticeHomePage from "@/pages/practice/home";
import PracticePreviewPage from "@/pages/practice/preview";
import PracticeReplayPage from "@/pages/practice/replay";
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
          {
            path: "courses",
            element: <MopCoursesPage />,
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
                path: "courses/:moduleId/lessons",
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
          // Clients management
          {
            path: "clients",
            children: [
              {
                index: true,
                element: <AdminClientsListPage />,
              },
              {
                path: "create",
                element: <AdminAddClientPage />,
              },
              {
                path: ":id/edit",
                element: <AdminUpdateClientPage />,
              },
              {
                path: ":id/licenses",
                element: <AdminLicensesListPage />,
              },
            ],
          },
          // Content management
          {
            path: "content",
            children: [
              // Cases management
              {
                path: "cases",
                children: [
                  {
                    index: true,
                    element: <AdminCasesListPage />,
                  },
                  {
                    path: "create",
                    element: <AdminCreateCasePage />,
                  },
                  {
                    path: ":id/edit",
                    element: <AdminUpdateCasePage />,
                  },
                  {
                    path: ":id/view",
                    element: <AdminViewCasePage />,
                  },
                ],
              },
              // Courses management
              {
                path: "courses",
                children: [
                  {
                    index: true,
                    element: <AdminCourseListPage />,
                  },
                  {
                    path: "create",
                    element: <CreateCoursePage />,
                  },
                  {
                    path: ":id/edit",
                    element: <CourseEditPage />,
                  },
                  {
                    path: ":id/detail-edit",
                    element: <CourseDetailEditPage />,
                  },
                  // Modules within courses
                  {
                    path: ":courseId/modules",
                    children: [
                      {
                        index: true,
                        element: <div>Modules List</div>, // TODO: Create modules list page
                      },
                      {
                        path: "create",
                        element: <CreateModulePage />,
                      },
                      {
                        path: ":id/edit",
                        element: <ModuleEditPage />,
                      },
                      {
                        path: ":id/detail-edit",
                        element: <ModuleDetailEditPage />,
                      },
                      // Quizzes within modules
                      {
                        path: ":moduleId/quizzes",
                        children: [
                          {
                            path: "create",
                            element: <CreateQuizPage />,
                          },
                          {
                            path: ":id/edit",
                            element: <EditQuizPage />,
                          },
                        ],
                      },
                      // Lessons within modules
                      {
                        path: ":moduleId/lessons",
                        children: [
                          {
                            index: true,
                            element: <div>Lessons List</div>, // TODO: Create lessons list page
                          },
                          {
                            path: "create",
                            element: <CreateLessonPage />,
                          },
                          {
                            path: ":id/edit",
                            element: <LessonEditPage />,
                          },
                          // Quizzes within lessons
                          {
                            path: ":lessonId/quizzes",
                            children: [
                              {
                                index: true,
                                element: <div>Quizzes List</div>, // TODO: Create quizzes list page
                              },
                              {
                                path: "create",
                                element: <CreateQuizPage />,
                              },
                              {
                                path: ":id/edit",
                                element: <EditQuizPage />,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Scenarios management
              {
                path: "scenarios",
                children: [
                  {
                    index: true,
                    element: <AdminScenariosListPage />,
                  },
                  {
                    path: "create",
                    element: <AdminScenariosCreatePage />,
                  },
                  {
                    path: ":id/edit",
                    element: <AdminEditScenarioPage />,
                  },
                  {
                    path: ":id/view",
                    element: <AdminViewScenarioPage />,
                  },
                ],
              },
            ],
          },
          // Admins management
          {
            path: "admins",
            children: [
              {
                index: true,
                element: <AdminsControlPage />,
              },
            ],
          },
        ],
      },
      {
        path: "practice",
        element: <PracticeLayout />,
        children: [
          {
            index: true,
            element: <PracticeHomePage />,
          },
          {
            path: "create",
            element: <PracticeCreatePage />,
          },
          {
            path: "preview",
            element: <PracticePreviewPage />,
          },
          {
            path: "replay/:practiceId",
            element: <PracticeReplayPage />,
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
          {
            path: "report/:practiceId",
            element: <EvaluationReportPage />,
          },
        ],
      },
    ],
  },
]);
