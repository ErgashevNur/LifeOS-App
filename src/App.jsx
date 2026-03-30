import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/root-layout.jsx";
import LandingPage from "./pages/landingPage.jsx";
import LoginPage from "./pages/login-page.jsx";
import NotFoundPage from "./pages/not-found-page.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
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
