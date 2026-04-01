import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/root-layout.jsx";
import AppLayout from "./layouts/app-layout.jsx";
import LandingPage from "./pages/landingPage.jsx";
import AuthPage from "./pages/auth-page.jsx";
import DashboardPage from "./pages/dashboard.jsx";
import AssistantPage from "./pages/assistant-page.jsx";
import AiAssistantPage from "./pages/ai-assistant-page.jsx";
import BooksPage from "./pages/books-page.jsx";
import GoalsPage from "./pages/goals-page.jsx";
import HabitsPage from "./pages/habits-page.jsx";
import HealthPage from "./pages/health-page.jsx";
import HealthyLifePage from "./pages/healthy-life-page.jsx";
import MasteryPage from "./pages/mastery-page.jsx";
import NetworkPage from "./pages/network-page.jsx";
import NetworkingPage from "./pages/networking-page.jsx";
import AnalyticsPage from "./pages/analytics-page.jsx";
import SettingsPage from "./pages/settings-page.jsx";
import UsersPage from "./pages/users-page.jsx";
import NotFoundPage from "./pages/not-found-page.jsx";
import ErrorPage from "./pages/error-page.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "auth",
        element: <AuthPage />,
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
            element: <DashboardPage />,
          },
          {
            path: "books",
            element: <BooksPage />,
          },
          {
            path: "goals",
            element: <GoalsPage />,
          },
          {
            path: "habits",
            element: <HabitsPage />,
          },
          {
            path: "healthy-life",
            element: <HealthyLifePage />,
          },
          {
            path: "health",
            element: <HealthPage />,
          },
          {
            path: "mastery",
            element: <MasteryPage />,
          },
          {
            path: "network",
            element: <NetworkPage />,
          },
          {
            path: "networking",
            element: <NetworkingPage />,
          },
          {
            path: "ai-assistant",
            element: <AiAssistantPage />,
          },
          {
            path: "assistant",
            element: <AssistantPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
