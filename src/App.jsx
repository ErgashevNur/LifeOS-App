import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/root-layout.jsx";
import AppLayout from "./layouts/app-layout.jsx";
import { Loader2 } from "lucide-react";

// Lazy loaded pages for performance optimization (Code Splitting)
const LandingPage = lazy(() => import("./pages/landingPage.jsx"));
const AuthPage = lazy(() => import("./pages/auth-page.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard.jsx"));
const AssistantPage = lazy(() => import("./pages/assistant-page.jsx"));
const AiAssistantPage = lazy(() => import("./pages/ai-assistant-page.jsx"));
const BooksPage = lazy(() => import("./pages/books-page.jsx"));
const GoalsPage = lazy(() => import("./pages/goals-page.jsx"));
const HabitsPage = lazy(() => import("./pages/habits-page.jsx"));
const HealthPage = lazy(() => import("./pages/health-page.jsx"));
const HealthyLifePage = lazy(() => import("./pages/healthy-life-page.jsx"));
const MasteryPage = lazy(() => import("./pages/mastery-page.jsx"));
const NetworkPage = lazy(() => import("./pages/network-page.jsx"));
const NetworkingPage = lazy(() => import("./pages/networking-page.jsx"));
const AnalyticsPage = lazy(() => import("./pages/analytics-page.jsx"));
const SettingsPage = lazy(() => import("./pages/settings-page.jsx"));
const UsersPage = lazy(() => import("./pages/users-page.jsx"));
const NotFoundPage = lazy(() => import("./pages/not-found-page.jsx"));
const ErrorPage = lazy(() => import("./pages/error-page.jsx"));

const PageLoader = () => (
  <div className="flex h-full w-full min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      <p className="text-sm font-bold tracking-widest uppercase">Yuklanmoqda...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: "auth",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AuthPage />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: <Navigate to="/auth?tab=login" replace />,
      },
      {
        path: "register",
        element: <Navigate to="/auth?tab=register" replace />,
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "books",
            element: (
              <Suspense fallback={<PageLoader />}>
                <BooksPage />
              </Suspense>
            ),
          },
          {
            path: "goals",
            element: (
              <Suspense fallback={<PageLoader />}>
                <GoalsPage />
              </Suspense>
            ),
          },
          {
            path: "habits",
            element: (
              <Suspense fallback={<PageLoader />}>
                <HabitsPage />
              </Suspense>
            ),
          },
          {
            path: "healthy-life",
            element: (
              <Suspense fallback={<PageLoader />}>
                <HealthyLifePage />
              </Suspense>
            ),
          },
          {
            path: "health",
            element: (
              <Suspense fallback={<PageLoader />}>
                <HealthPage />
              </Suspense>
            ),
          },
          {
            path: "mastery",
            element: (
              <Suspense fallback={<PageLoader />}>
                <MasteryPage />
              </Suspense>
            ),
          },
          {
            path: "network",
            element: (
              <Suspense fallback={<PageLoader />}>
                <NetworkPage />
              </Suspense>
            ),
          },
          {
            path: "networking",
            element: (
              <Suspense fallback={<PageLoader />}>
                <NetworkingPage />
              </Suspense>
            ),
          },
          {
            path: "ai-assistant",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AiAssistantPage />
              </Suspense>
            ),
          },
          {
            path: "assistant",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AssistantPage />
              </Suspense>
            ),
          },
          {
            path: "analytics",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AnalyticsPage />
              </Suspense>
            ),
          },
          {
            path: "settings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            ),
          },
          {
            path: "users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UsersPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
