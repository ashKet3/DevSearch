import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { Layout } from "./components/Layout";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { Profile } from "./pages/Profile";
import { Messages } from "./pages/Messages";
import { Project } from "./pages/Project";
import { Search } from "./pages/Search";

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // if (!currentUser) {
    //   return <Navigate to="/login" />;
    // }
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <HomePage />
        },
        {
          path: "/user/:slug",
          element: <Profile />,
        },
        {
          path: "/messages/:slug?",
          element: <Messages />,
        },
        {
          path: "/project/:slug",
          element: <Project />,
        },
        {
          path: "/search/:query?",
          element: <Search />,
        },
      ],
    },
    {
      path: "/auth/login",
      element: <Login />,
    },
    {
      path: "/auth/register",
      element: <Register />,
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
